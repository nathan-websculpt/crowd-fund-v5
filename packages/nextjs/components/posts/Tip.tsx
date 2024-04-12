import { useState } from "react";
import { encodeFunctionData, parseEther } from "viem";
import { useSmartAccount } from "~~/hooks/burnerWallet/useSmartAccount";
import { useSmartTransactor } from "~~/hooks/burnerWallet/useSmartTransactor";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { getContractNames } from "~~/utils/scaffold-eth/contractNames";

interface TipProps {
  id: number;
}

export const Tip = (fundRun: TipProps) => {
  const donationAmt = "0.001";
  const { scaSigner } = useSmartAccount();
  const transactor = useSmartTransactor();
  const [isLoading, setIsLoading] = useState(false);
  const contractNames = getContractNames();
  const { data: deployedContractData } = useDeployedContractInfo(contractNames[0]);

  const uoCallData = encodeFunctionData({
    abi: [
      {
        inputs: [
          {
            internalType: "uint16",
            name: "_id",
            type: "uint16",
          },
        ],
        name: "donateToFundRun",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
    ],
    functionName: "donateToFundRun",
    args: [fundRun?.id],
  });

  const sendUserOp = async () => {
    if (!scaSigner) {
      notification.error("Cannot access smart account");
      return;
    }
    setIsLoading(true);
    try {
      const userOperationPromise = scaSigner.sendUserOperation({
        target: deployedContractData.address,
        data: uoCallData,
        // value: donationAmt,
        value: parseEther(donationAmt),
      });

      await transactor(() => userOperationPromise);
    } catch (e) {
      notification.error("Oops, something went wrong");
      console.error("Error sending transaction: ", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="tooltip tooltip-right tooltip-primary" data-tip="TIP 0.001 Ether">
        <button className="ml-2 btn btn-primary" onClick={() => sendUserOp()} disabled={isLoading}>
          {isLoading ? <span className="loading loading-spinner loading-sm"></span> : <>TIP</>}
        </button>
      </div>
    </>
  );
};
