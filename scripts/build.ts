async function main() {
  await Deno.run({
    cmd: ["wasm-pack", "build", "--target", "deno", "--dev"],
  }).status();
  await Deno.remove("./pkg/.gitignore");
}

main();
