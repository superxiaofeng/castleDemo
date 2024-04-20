const { ccclass, property } = cc._decorator;

@ccclass
export default class Q2 {
  findTwoNumbersWithSum1(arr1, arr2, sum) {
    //两个循环都是N次，时间复杂度为O(N^2)。
    for (let num1 of arr1) {
      for (let num2 of arr2) {
        if (num1 + num2 === sum) {
          return true;
        }
      }
    }
    return false;
  }

  findTwoNumbersWithSum2(arr1, arr2, sum) {
    // 并列循环，时间复杂度为O(N)
    const prevNums = {};
    for (let i = 0; i < arr1.length; i++) {
      prevNums[arr1[i]] = i;
    }
    for (let i = 0; i < arr2.length; i++) {
      let targetNum = sum - arr2[i];
      if (prevNums[targetNum] !== undefined) {
        return true;
      }
    }
    return false;
  }
}
