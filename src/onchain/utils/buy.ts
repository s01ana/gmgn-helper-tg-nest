import { ethers } from "ethers"
import { bscProvider, V2_ABI, V2_CONTRACT_ADDRESS } from "../../constant.js"
import ERC20_ABI from "../../abi/erc20.js";
import sendMessage from "../../telegram/utils/sendMessage.js";

const buyToken = async (privateKey: string, tokenAddress: string, amount: number, chatId: number) => {
  const wallet = new ethers.Wallet(privateKey, bscProvider);

  const v2Contract = new ethers.Contract(V2_CONTRACT_ADDRESS, V2_ABI, wallet);
  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
  
  let tx = null;

  try {
    tx = await v2Contract.buyTokenAMAP(
      tokenAddress,
      BigInt(amount * 10**18),
      0,
      { value: BigInt(amount * 10 ** 18), gasPrice: null }
    )
  
    await tx.wait();
    await tokenContract.approve(V2_CONTRACT_ADDRESS, BigInt(10 ** 27));
  } catch (error) {
    console.log(`[BuyToken]: ${error.code}`);
    if (error.code === "INSUFFICIENT_FUNDS")
      sendMessage(chatId, `❌[BuyToken]: Error: Insufficient funds in your wallet.`);
  }

  return tx;
}

export default buyToken;