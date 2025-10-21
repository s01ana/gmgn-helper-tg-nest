import { ethers } from "ethers";

import ERC20_ABI from "../../abi/erc20.js";
import sendMessage from "../../telegram/utils/sendMessage.js";

import { bscProvider, V2_ABI, V2_CONTRACT_ADDRESS } from "../../constant.js";

const sellToken_ = async (privateKey: string, order: any) => {
  let tx = null;
  try {
    const wallet = new ethers.Wallet(privateKey, bscProvider);
    const v2Contract = new ethers.Contract(V2_CONTRACT_ADDRESS, V2_ABI, wallet);
    const tokenContract = new ethers.Contract(order.tokenAddress, ERC20_ABI, wallet);
    const balance = await tokenContract.balanceOf(wallet.address);

    if (balance.toString() === '0') {
      console.error(`[SellToken]: balance is 0, sellOrder: ${wallet.address} ${order.tokenAddress}`);
      return null;
    }

    tx = await v2Contract.sellToken(order.tokenAddress, balance);
    await tx.wait();
    sendMessage(order.chatId, `📉 Sold ${(balance / BigInt(10 ** 18)).toString()} ${order.tokenName} (${order.tokenSymbol}) successfully\nCA: <code>${order.tokenAddress}</code>\n` +
      `<a href="https://bscscan.com/tx/${tx.hash}">View on BscScan</a>`);
  } catch (error) {
    console.error(`[SellToken]: sellOrder: ${order.tokenAddress} ${error}`);
  }
  return tx;
}

export default sellToken_;