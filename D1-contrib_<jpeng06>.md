#A header with the final test pass rate and coverage rate:




##description of contributions

null

###implemtation of addData

*       data error check (ommited)
*	data decode from base64 to buffer (revised)
*	buffer to readable file, load data and cache on disk

###implemtation of removeData
* remove data cached on disk (revised)
* delete file/folder using recursion (later omitted)

###implementation of Insightest
* load zip file in before
* encode data to base64
* tests for basic error checking

###implementation of test for EchoSpec
* write some tests for coverage improvement 
	
###note: Micheal also participated in code debugging/revision for functions that I mentioned above.
Special thanks to him because I was quite surprise that he was able to get coverage to 99% 
	
##A series to some of my GitHub commits
* https://github.com/CS310-2017Jan/cpsc310project_team78/commit/61b98fedf4cd0d3c964937b00d10b493683f9704
* https://github.com/CS310-2017Jan/cpsc310project_team78/commit/414cb4a1d33c5425fc1c6150d47c2f4aadde8d95
* https://github.com/CS310-2017Jan/cpsc310project_team78/commit/61b98fedf4cd0d3c964937b00d10b493683f9704
* https://github.com/CS310-2017Jan/cpsc310project_team78/commit/9d5e9be5d43eb38ca1d1a18eec395785c992a7b2
* https://github.com/CS310-2017Jan/cpsc310project_team78/commit/6096cea21109208208e8e5fda73598d7a71b81ac

##deliverable retrospect
Problems encountered for D1: 
* Lack of communication in the beginning phase of project, which leaves some serious potential bugs in 
early design of InsightFacade. 
* Did not fully understand how autotest work, spend too much time to debug wrong code. (eg. autotest skipping tests
and debug for addData for too long)
* Information given by autotest something is misleading and seriously delayed the entire project process. (eg. autotest
says queries failed for different cases, but turns out there is a bug in isBase64(), which is nothing to do with Query at all)

Help for D1:
* TA is definitely helpful comparing to my other comp sci courses. When I have problem with autotest, they are willing to
log in the system and let me see what the error was. +1 for TAs
* Public posts on Piazza is somewhat helpful, TA tends to be really careful about what they wrote.
* Partner is definitely helpful. I was surprise to see that he almost completely rewrite addData just for debugging
a uncaught exception. He is definitely a dedicated hardworking teammate.
* Google is somewhat helpful in D1. Since libraries that allowed to use is limited, that makes 95% of google solution 
nonsense.

