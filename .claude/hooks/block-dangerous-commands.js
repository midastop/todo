#!/usr/bin/env node
"use strict";

// PreToolUse 훅: rm -rf 같은 위험한 명령을 실행되기 전에 차단한다.
//
// stdin 으로 훅 입력 JSON 을 받아 tool_input.command 를 검사하고,
// 위험 패턴에 걸리면 permissionDecision "deny" 를 출력해 실행을 막는다.
// 안전하면 아무것도 출력하지 않고 끝낸다(= 그대로 진행).
//
// 입력을 해석하지 못하면 차단하지 않는다.
// 훅이 고장났을 때 모든 명령이 막혀 작업이 멈추는 쪽이 더 위험하기 때문이다.

// "cd /tmp && rm -rf *" 처럼 뒤에 숨은 명령도 각각 보려고 구분자로 나눈다
function splitSegments(command) {
  return command.split(/;|\|\||&&|\||\n/);
}

// 앞에 붙은 sudo, 환경변수 대입(FOO=bar) 등을 벗겨 실제 명령어를 얻는다.
// "git rm -rf" 같은 다른 명령의 하위 명령을 rm 으로 오인하지 않기 위해 필요하다.
function stripPrefixes(segment) {
  let s = segment.trim();
  for (;;) {
    const next = s
      .replace(/^(sudo|command|env|time|nohup)\s+/, "")
      .replace(/^[A-Za-z_][A-Za-z0-9_]*=\S*\s+/, "");
    if (next === s) return s;
    s = next;
  }
}

// 세그먼트가 rm 명령이면 플래그와 삭제 대상을 뜯어서 돌려준다
function parseRm(segment) {
  const matched = stripPrefixes(segment).match(/^rm(\s+.*)?$/);
  if (!matched) return null;
  const args = matched[1] || "";
  const flags = (args.match(/(?:^|\s)--?[A-Za-z-]+/g) || []).join(" ");
  return {
    recursive: /--recursive|(?:^|\s)-[A-Za-z]*[rR]/.test(flags),
    force: /--force|(?:^|\s)-[A-Za-z]*f/.test(flags),
    targets: (args.match(/(?:^|\s)(?!-)\S+/g) || []).map((t) => t.trim()),
  };
}

// 지우면 사실상 복구가 불가능한 위치
const CRITICAL_TARGETS = [
  /^\/$/,
  /^\/\*/,
  /^~$/,
  /^~\//,
  /^\$HOME/,
  /^\*$/,
  /^\.$/,
  /^\.\.$/,
  /^\.\.\//,
  /^\/(bin|boot|dev|etc|lib|proc|sys|usr|var)(\/|$)/,
  /^[A-Za-z]:[\/]?$/,
  /^\/[a-z]\/?$/i,
];

function isCriticalTarget(target) {
  return CRITICAL_TARGETS.some((re) => re.test(target));
}

function anyRm(command, predicate) {
  return splitSegments(command).some((segment) => {
    const rm = parseRm(segment);
    return rm !== null && predicate(rm);
  });
}

const CHECKS = [
  {
    name: "rm 재귀 + 강제 삭제",
    test: (c) => anyRm(c, (rm) => rm.recursive && rm.force),
    reason:
      "rm 에 재귀(-r)와 강제(-f)가 함께 쓰였습니다. 확인 없이 하위 전체를 지우고 되돌릴 수 없습니다.",
  },
  {
    name: "중요 경로 재귀 삭제",
    test: (c) =>
      anyRm(c, (rm) => rm.recursive && rm.targets.some(isCriticalTarget)),
    reason:
      "루트(/), 홈(~), 드라이브 루트, 시스템 디렉터리를 재귀 삭제하려고 합니다.",
  },
  {
    name: "Remove-Item 재귀 + 강제 삭제 (PowerShell)",
    test: (c) =>
      /remove-item|(?:^|\s|;)ri\s/i.test(c) &&
      /(?:^|\s)-rec[a-z]*/i.test(c) &&
      /(?:^|\s)-fo[a-z]*/i.test(c),
    reason:
      "Remove-Item 에 -Recurse 와 -Force 가 함께 쓰였습니다. 휴지통을 거치지 않고 삭제됩니다.",
  },
  {
    name: "디스크에 직접 쓰기",
    test: (c) => /\bdd\b[^;|&\n]*\bof=\/dev\//.test(c),
    reason:
      "dd 로 블록 장치에 직접 쓰면 디스크 내용이 복구 불가능하게 덮어써집니다.",
  },
  {
    name: "파일시스템 포맷",
    test: (c) =>
      /\bmkfs(\.[a-z0-9]+)?\b/.test(c) || /\bformat-volume\b/i.test(c),
    reason: "파일시스템을 새로 만들면 해당 볼륨의 데이터가 전부 사라집니다.",
  },
  {
    name: "장치 파일 덮어쓰기",
    test: (c) => />\s*\/dev\/(sd|nvme|hd|disk)/.test(c),
    reason: "출력 리다이렉션으로 디스크 장치를 덮어쓰려고 합니다.",
  },
  {
    name: "포크 폭탄",
    test: (c) => /:\s*\(\s*\)\s*\{[^}]*\|[^}]*&[^}]*\}/.test(c),
    reason: "프로세스를 무한 증식시켜 시스템을 멈추게 합니다.",
  },
  {
    name: "루트 권한 일괄 변경",
    test: (c) =>
      /\bch(mod|own)\b[^;|&\n]*\s-[A-Za-z]*R[A-Za-z]*\b[^;|&\n]*\s\/(\s|$)/.test(
        c,
      ),
    reason:
      "루트 전체의 권한/소유자를 재귀로 바꾸면 시스템이 부팅되지 않을 수 있습니다.",
  },
];

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  raw += chunk;
});
process.stdin.on("end", () => {
  let command = "";
  try {
    const input = JSON.parse(raw);
    command = (input && input.tool_input && input.tool_input.command) || "";
  } catch (error) {
    process.exit(0);
  }
  if (!command) process.exit(0);

  const hit = CHECKS.find((check) => check.test(command));
  if (!hit) process.exit(0);

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason:
          "[위험 명령 차단] " +
          hit.name +
          "\n" +
          hit.reason +
          "\n\n실행하려던 명령: " +
          command +
          "\n\n정말 필요하면 사용자에게 직접 실행을 요청하세요. " +
          "규칙은 .claude/hooks/block-dangerous-commands.js 에 있습니다.",
      },
      systemMessage: "🛑 위험한 명령을 차단했습니다: " + hit.name,
    }),
  );
  process.exit(0);
});
