const Benchmark = require("benchmark");
const diff = require("./dist").default;

console.log(`\n## start`);

const suite = new Benchmark.Suite("diff");
suite
  .add("not equal 1000 items", {
    fn: () =>
      diff(
        new Array(1000).fill(0),
        new Array(1000).fill(1)
      )
  })
  .add("equal 1000 items", {
    fn: () =>
      diff(
        new Array(1000).fill(1),
        new Array(1000).fill(1)
      )
  })
  .on("cycle", event => {
    console.log(String(event.target));
  })
  .on("complete", () => {
  })
  .run();
