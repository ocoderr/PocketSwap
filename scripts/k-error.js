// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  const [account] = await ethers.getSigners();
  // We get the contract to deploy
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const usdt = await MockERC20.deploy();
  await usdt.deployed();
  console.log("usdt deployed to:", usdt.address);

  const WETH9 = await hre.ethers.getContractFactory("WETH9");
  const weth = await WETH9.deploy();
  await weth.deployed();
  console.log("weth deployed to:", weth.address);

  const Pocket = await hre.ethers.getContractFactory("Pocket");
  const pocket = await Pocket.deploy();
  await pocket.deployed();
  console.log("pocket deployed to:", pocket.address);

  const PocketSwapFactory = await hre.ethers.getContractFactory(
    "PocketSwapFactory"
  );
  const pocketSwapFactory = await PocketSwapFactory.deploy();
  await pocketSwapFactory.deployed();
  console.log("pocketSwapFactory deployed to:", pocketSwapFactory.address);

  const PocketSwapRouter = await hre.ethers.getContractFactory(
    "PocketSwapRouter"
  );
  const router = await PocketSwapRouter.deploy(
    pocketSwapFactory.address,
    weth.address,
    pocket.address
  );
  await router.deployed();
  console.log("router deployed to:", router.address);

  const PocketSwap = await hre.ethers.getContractFactory("PocketSwap");
  const swap = await PocketSwap.deploy(
    router.address,
    pocketSwapFactory.address,
    pocket.address,
    weth.address
  );
  await swap.deployed();
  console.log("swap deployed to:", swap.address);

  let overrides = {
    value: 0,
    gasLimit: 3828084,
    gasPrice: 1000000000,
  };

  console.log("mint usdt\n");

  // mint usdt
  let maxAmount = ethers.utils.parseEther("1000000000");
  let tx = await usdt.mint(account.address, maxAmount, overrides);
  await tx.wait();

  console.log(`mint ${maxAmount} usdt to ${account.address}`);
  console.log(`tx ${tx.hash}`);
  let balanceOf = await usdt.balanceOf(account.address);
  console.log(
    `${account.address} balanceOf usdt ${ethers.utils.formatEther(
      balanceOf.toString()
    )}\n`
  );

  // mint weth
  console.log("mint weth\n");
  maxAmount = ethers.utils.parseEther("100");
  tx = await weth.deposit({
    value: maxAmount,
    gasLimit: 3828084,
    gasPrice: 1000000000,
  });
  await tx.wait();
  console.log(`mint ${maxAmount} weth to ${account.address}`);
  console.log(`tx ${tx.hash}`);
  balanceOf = await weth.balanceOf(account.address);
  console.log(
    `${account.address} balanceOf weth ${ethers.utils.formatEther(
      balanceOf.toString()
    )}\n`
  );

  console.log(`start add liquidity usdt-pocket\n`);

  // const maxAmount = ethers.utils.parseEther('10');
  tx = await usdt.approve(
    swap.address,
    ethers.utils.parseEther("100000"),
    overrides
  );
  await tx.wait();

  tx = await pocket.approve(
    swap.address,
    ethers.utils.parseEther("100000"),
    overrides
  );
  await tx.wait();

  addLpParam = [
    usdt.address,
    pocket.address,
    account.address,
    ethers.utils.parseEther("1000"),
    ethers.utils.parseEther("1000"),
    0,
    0,
    2651726900,
  ];

  tx = await swap.addLiquidity(addLpParam, {
    value: 0,
    gasLimit: 38280840,
    gasPrice: 1000000000,
  });
  await tx.wait();

  console.log(`tx ${tx.hash}`);

  let LpAddress = await pocketSwapFactory.getPair(usdt.address, pocket.address);
  console.log(`LpAddress ${LpAddress}`);


  console.log(`swap usdt to pocket`);
  const amountIn = ethers.utils.parseEther('1');
  swapParam = [
    usdt.address,
    pocket.address,account.address, 2651726900,amountIn,0
  ]

  tx = await swap.swap(swapParam, {
    value: 0,
    gasLimit: 38280840,
    gasPrice: 1000000000,
  })
  await tx.wait();
  console.log(`tx ${tx.hash}\n`);

  console.log(`swap pocket to usdt\n`);
  console.log(`k-error....\n`);
  swapParam = [
    pocket.address,
    usdt.address,account.address, 2651726900,amountIn,0
  ]

  tx = await swap.swap(swapParam, {
    value: 0,
    gasLimit: 38280840,
    gasPrice: 1000000000,
  })
  await tx.wait();

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
