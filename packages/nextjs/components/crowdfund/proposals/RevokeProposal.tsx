import { useState } from "react";
import { encodeFunctionData } from "viem";
import { useSmartAccount } from "~~/hooks/burnerWallet/useSmartAccount";
import { useSmartTransactor } from "~~/hooks/burnerWallet/useSmartTransactor";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { getContractNames } from "~~/utils/scaffold-eth/contractNames";

interface RevokeProposalProps {
  fundRunId: number;
  proposalId: number;
}

export const RevokeProposal = (proposal: RevokeProposalProps) => {
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
          {
            internalType: "uint16",
            name: "_proposalId",
            type: "uint16",
          },
        ],
        name: "revokeMultisigProposal",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    functionName: "revokeMultisigProposal",
    args: [proposal.fundRunId, proposal.proposalId],
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
    <>
      <td className="w-1/12 text-center md:py-4">
        <div className="tooltip tooltip-primary tooltip-left" data-tip="Only creator of proposal can revoke.">
          <button className="w-full btn btn-primary" onClick={() => sendUserOp()} disabled={isLoading}>
            {isLoading ? <span className="loading loading-spinner loading-sm"></span> : <>Revoke</>}
          </button>
        </div>
      </td>
    </>
  );
};
