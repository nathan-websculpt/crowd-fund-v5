import { useEffect, useState } from "react";
import { SignMessageReturnType, encodeFunctionData, keccak256, toBytes } from "viem";
import getNonce from "~~/helpers/getNonce";
import getSocialManagementDigest from "~~/helpers/getSocialManagementDigest";
import { useSmartAccount } from "~~/hooks/burnerWallet/useSmartAccount";
import { useSmartTransactor } from "~~/hooks/burnerWallet/useSmartTransactor";
import { useDeployedContractInfo, useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { getContractNames } from "~~/utils/scaffold-eth/contractNames";

interface SupportSocialProposalProps {
  fundRunId: number;
  socialProposalId: number;
  proposedBy: string;
  postText: string;
}

export const SupportSocialProposal = (sp: SupportSocialProposalProps) => {
  const [supportSignature, setSupportSignature] = useState<SignMessageReturnType>();
  const { scaAddress, scaSigner, smartWalletSigner } = useSmartAccount();
  const transactor = useSmartTransactor();
  const [isLoading, setIsLoading] = useState(false);
  const contractNames = getContractNames();
  const { data: deployedContractData } = useDeployedContractInfo(contractNames[0]);

  useEffect(() => {
    if (supportSignature !== undefined) {
      sendUserOp();
    }
  }, [supportSignature]);

  const { data: fundRunNonce } = useScaffoldContractRead({
    contractName: "CrowdFund",
    functionName: "getSocialManagementNonce",
    args: [sp.fundRunId],
  });

  const supportProposal = async () => {
    const nonce = getNonce(fundRunNonce);
    const digest = await getSocialManagementDigest(nonce, sp?.postText, sp?.proposedBy);

    // const proposalSupportSig: any = await scaSigner?.signMessage(digest.toString());
    //^^^ doesn't work

    // const proposalSupportSig: any = await scaSigner?.signMessage(toBytes(digest));
    //^^^ doesn't work

    // const proposalSupportSig: any = await scaSigner?.signMessage(toBytes(digest).toString());
    //^^^ doesn't work

    // const proposalSupportSig: any = await scaSigner?.signMessage({
    //   // account: scaAddress,
    //   message: { raw: toBytes(digest) },
    // });
    //^^^ doesn't work

    // const proposalSupportSig: any = await scaSigner?.signMessage({
    //   // account: scaAddress,
    //   msg: { raw: toBytes(digest) },
    // });
    //TODO: ^^^retry

    // const proposalSupportSig: any = await scaSigner?.signMessage({
    //   msg: toBytes(digest) ,
    // });
    //^^^didn't work
    
    // const proposalSupportSig: any = await scaSigner?.signMessage( "\x19Ethereum Signed Message:\n" + toBytes(digest));
    //^^^didn't work

    // const proposalSupportSig: any = await scaSigner?.signMessage(toBytes("\x19Ethereum Signed Message:\n") + toBytes(digest));
    //^^^didn't work

    // const proposalSupportSig: any = await smartWalletSigner?.signMessage(toBytes(digest));

    const proposalSupportSig: any = await scaSigner?.signMessage(toBytes(digest));
    setSupportSignature(proposalSupportSig);
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
                  internalType: "bytes",
                  name: "_signature",
                  type: "bytes",
                },
                {
                  internalType: "uint16",
                  name: "_id",
                  type: "uint16",
                },
                {
                  internalType: "uint16",
                  name: "_socialProposalId",
                  type: "uint16",
                },
              ],
              name: "supportSocialProposal",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
          functionName: "supportSocialProposal",
          args: [supportSignature, sp?.fundRunId, sp?.socialProposalId],
          // nonce: 17,
        }),
      });

      await transactor(() => userOperationPromise);
    } catch (e) {
      notification.error("Oops, something went wrong");
      console.error("Error sending transaction: ", e);
    } finally {
      setIsLoading(false);
      setSupportSignature(undefined);
    }
  };

  return (
    <>
      <td className="w-1/12 text-center md:py-4">
        <div className="tooltip tooltip-primary tooltip-right" data-tip="Support this proposal before finalizing.">
          <button className="w-full btn" onClick={() => supportProposal()} disabled={isLoading}>
            {isLoading ? <span className="loading loading-spinner loading-sm"></span> : <>Support</>}
          </button>
        </div>
      </td>
    </>
  );
};
