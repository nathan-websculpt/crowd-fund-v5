import { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { encodeFunctionData } from "viem";
import getNonce from "~~/helpers/getNonce";
import { GQL_SIGNATURES } from "~~/helpers/getQueries";
import { useSmartAccount } from "~~/hooks/burnerWallet/useSmartAccount";
import { useSmartTransactor } from "~~/hooks/burnerWallet/useSmartTransactor";
import { useDeployedContractInfo, useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { getContractNames } from "~~/utils/scaffold-eth/contractNames";

interface FinalizeProposalProps {
  fundRunId: number;
  proposalId: number;
  amount: bigint;
  to: string;
  proposedBy: string;
  reason: string;
}

export const FinalizeProposal = (proposal: FinalizeProposalProps) => {
  const [nonce, setNonce] = useState<bigint>();
  const tx = { amount: proposal.amount, to: proposal.to, proposedBy: proposal.proposedBy, reason: proposal.reason };

  const [signaturesList, setSignaturesList] = useState<string[]>();

  const [getProposal, { loading, error, data }] = useLazyQuery(GQL_SIGNATURES());

  const { scaSigner } = useSmartAccount();
  const transactor = useSmartTransactor();
  const [isLoading, setIsLoading] = useState(false);
  const contractNames = getContractNames();
  const { data: deployedContractData } = useDeployedContractInfo(contractNames[0]);

  useEffect(() => {
    if (error !== undefined && error !== null) console.log("GQL_SIGNATURES Query Error: ", error);
  }, [error]);

  useEffect(() => {
    if (nonce !== undefined) {
      getProposal({ variables: { slug1: proposal.fundRunId, slug2: proposal.proposalId } });
    }
  }, [nonce]);

  useEffect(() => {
    if (data !== undefined) {
      const thisArr = [];
      for (let i = 0; i < data.proposals[0].signatures.length; i++) {
        thisArr.push(data.proposals[0].signatures[i].signature);
      }
      setSignaturesList(thisArr);
    }
  }, [data]);

  useEffect(() => {
    if (signaturesList !== undefined && signaturesList.length > 0) {
      console.log("signatures list before sending user op: ", signaturesList);
      sendUserOp();
    }
  }, [signaturesList]);

  const { data: fundRunNonce } = useScaffoldContractRead({
    contractName: "CrowdFund",
    functionName: "getNonce",
    args: [proposal.fundRunId],
  });

  const finishProposal = () => {
    const nonce = getNonce(fundRunNonce);
    console.log("after getNonce(): ", nonce);
    setNonce(nonce);
  };

  const sendUserOp = async () => {
    if (!scaSigner) {
      notification.error("Cannot access smart account");
      return;
    }
    setIsLoading(true);
    try {
      const userOperationPromise = scaSigner.sendUserOperation({
        target: deployedContractData.address,
        data: encodeFunctionData({
          abi: [
            {
              inputs: [
                {
                  components: [
                    {
                      internalType: "uint256",
                      name: "amount",
                      type: "uint256",
                    },
                    {
                      internalType: "address",
                      name: "to",
                      type: "address",
                    },
                    {
                      internalType: "address",
                      name: "proposedBy",
                      type: "address",
                    },
                    {
                      internalType: "string",
                      name: "reason",
                      type: "string",
                    },
                  ],
                  internalType: "struct CrowdFundLibrary.MultiSigRequest",
                  name: "_tx",
                  type: "tuple",
                },
                {
                  internalType: "uint256",
                  name: "_nonce",
                  type: "uint256",
                },
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
                {
                  internalType: "bytes[]",
                  name: "_signaturesList",
                  type: "bytes[]",
                },
              ],
              name: "multisigWithdraw",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
          functionName: "multisigWithdraw",
          args: [tx, nonce, proposal.fundRunId, proposal.proposalId, signaturesList],
        }),
      });

      await transactor(() => userOperationPromise);
    } catch (e) {
      notification.error("Oops, something went wrong");
      console.error("Error sending transaction: ", e);
    } finally {
      setIsLoading(false);
      setNonce(undefined);
    }
  };

  return (
    <>
      <td className="w-1/12 text-center md:py-4">
        <div className="tooltip tooltip-primary tooltip-top" data-tip="Done co-signing? Send the transaction.">
          <button className="w-full btn" onClick={() => finishProposal()} disabled={isLoading || loading}>
            {isLoading || loading ? <span className="loading loading-spinner loading-sm"></span> : <>Finalize</>}
          </button>
        </div>
      </td>
    </>
  );
};
