---
name: code-review
description: 코드의 버그·보안·성능 문제를 리뷰할 때 사용
disable-model-invocation: true
allowed-tools: Read
---

MODE: $ARGUMENTS

- BUGS -> 버그만 검사
- SECURITY -> 보안만 검사
- PERFORMANCE -> 성능만 검사
- 값이 없으며 -> 전체 종합 리뷰
