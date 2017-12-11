#Test summary: 100% 
62 passing, 0 failing, 0 skipped

Line coverage: 96%

#D2 Contributions:
Implemetation of following functions:

* Request.echo
* Request.handleReq
* Server.start
* Server.stop
* DataController.room_readValidContents

Implemetation of EchoSpec

#Links:
[room parser debug](https://github.com/CS310-2017Jan/cpsc310project_team78/commit/3bc51c36f5afdada7d7fc14838d4f6329bab5cd6)

[updated REST tests](https://github.com/CS310-2017Jan/cpsc310project_team78/commit/12d44f0eb0c138c769827080e6ffd83b0d026f45)

[added tests for server/client](https://github.com/CS310-2017Jan/cpsc310project_team78/commit/39238b042698605d2458781571d2ef04c31e1335)

[Added Endpoint Support](https://github.com/CS310-2017Jan/cpsc310project_team78/commit/9c94461f7466fc7ba301997f301f505b1d1eea0f)

[server REST fixes](https://github.com/CS310-2017Jan/cpsc310project_team78/commit/50257e892a09fa1f4863d8c22061bce149433e3f)


#retrospective
Although D3 was a query-based deliverable, REST implementation was quite tricky at the beginning. The biggest challenge was to 
investigate the source of timing out. After using several logs, the problem turns out to be in DataController. The room parser 
was not having a proper html validator and hence causing listeners hanging and timeout. Other than this, D3 was quite light 
comparing to D1.
