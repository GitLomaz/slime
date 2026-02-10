class Random {
  static oneIn(x) {
    return Math.floor(Math.random() * x) === 0;
  }

  static xInY(x, y) {
    return Math.floor(Math.random() * y) < x;
  }

  static coinFlip(string = false) {
    let result = this.oneIn(2);
    return string ? (result ? 'heads' : 'tails') : result;
  }

  static between(x, y, inclusive = true) {
    let min = Math.min(x, y);
    let max = Math.max(x, y);
    return Math.floor(Math.random() * (max - min + (inclusive ? 1 : 0))) + min;
  }

  static die(sides = 6) {
    return this.between(1, sides);
  }

  static dice(config = [6, 6]) {
    let results = {
      total: 0,
      rolls: []
    };
    config.forEach((sides, i) => {
      results.rolls[i] = this.die(sides);
      results.total += results.rolls[i];
    });
    return results;
  }
}

// function testFunctions(times) {
//   let tests = [
//     {
//       ftn: oneIn,
//       params: {
//         x: 10
//       },
//       results: {true: 0, false: 0},
//       iterations: times
//     }
//   ]
//   let XInYTest = {
//     ftn: xInY,
//     params: {
//       x: 3,
//       y: 10
//     },
//     results: {true: 0, false: 0},
//     iterations: times
//   }
//   let clinFlipTest1 = {
//     ftn: coinFlip,
//     params: {},
//     results: {true: 0, false: 0},
//     iterations: times
//   }
//   let clinFlipTest2 = {
//     ftn: coinFlip,
//     params: {string: true},
//     results: {heads: 0, tails: 0},
//     iterations: times
//   }
//   let betweenTest1 = {
//     ftn: between,
//     params: {
//       x: 2,
//       y: 10
//     },
//     results: {},
//     iterations: times
//   }
//   let betweenTest2 = {
//     ftn: between,
//     params: {
//       x: 10,
//       y: 2,
//       inclusive: true
//     },
//     results: {},
//     iterations: times
//   }
//   let results = []
//   for (let i = 0; i < times; i++) {
//     /*
//     oneInTest.results[ oneInTest.ftn(oneInTest.params.x)]++;
//     XInYTest.results[ xInY(XInYTest.params.x, XInYTest.params.y)]++;
//     clinFlipTest1.results[ coinFlip() ]++;
//     clinFlipTest2.results[ coinFlip(clinFlipTest2.params.string) ]++;
//     betweenTest1.results
//     let betweenResult1 = between(betweenTest1.params.x, betweenTest1.params.y);
//     let betweenResult2 = between(betweenTest2.params.x, betweenTest2.params.y, betweenTest2.params.inclusive);
//     */
//   }

//   return {
//     oneIn: oneInTest, 
//     xinY: XInYTest,
//     coinFlip1: clinFlipTest1,
//     coinFlip2: clinFlipTest2,
//     between1: betweenTest1,
//     between2: betweenTest2
//   }
// }
// testFunctions(1000000);

