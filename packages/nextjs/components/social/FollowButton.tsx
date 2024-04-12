import { useState } from "react";
import { encodeFunctionData } from "viem";
import { useSmartAccount } from "~~/hooks/burnerWallet/useSmartAccount";
import { useSmartTransactor } from "~~/hooks/burnerWallet/useSmartTransactor";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { getContractNames } from "~~/utils/scaffold-eth/contractNames";

interface FollowButtonProps {
  fundRunId: number;
}

export const FollowButton = (fundRun: FollowButtonProps) => {
  const { scaAddress, scaSigner } = useSmartAccount();
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
            name: "_fundRunId",
            type: "uint16",
          },
        ],
        name: "follow",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    functionName: "follow",
    args: [fundRun.fundRunId],
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
    <button className="btn btn-primary btn-sm" onClick={() => sendUserOp()} type="button">
      Follow
    </button>
  );
};
