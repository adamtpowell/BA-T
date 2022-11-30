

Boot interpreter

1. find line number
2. if line number in compilation array
3.     execute line
4. else
5.     Tokenize line
6.     Compile line
7.     Add to array
8.     execute line
9. move to the new line
10. goto 1


* To improve:
    - Could do it by line segment (seperated by ":" )
    - One instruction for each tokenize compile call
    - 