async function main() {
  await Deno.run({
    cmd: ["wasm-pack", "build", "--target", "deno", "--release"],
  }).status();
  await Deno.remove("./pkg/.gitignore");
}

main();
