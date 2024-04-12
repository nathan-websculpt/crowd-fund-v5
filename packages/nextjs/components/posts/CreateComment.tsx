import { useState } from "react";
import { encodeFunctionData } from "viem";
import { useSmartAccount } from "~~/hooks/burnerWallet/useSmartAccount";
import { useSmartTransactor } from "~~/hooks/burnerWallet/useSmartTransactor";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { getContractNames } from "~~/utils/scaffold-eth/contractNames";

interface CreateCommentProps {
  postId: string;
}

export const CreateComment = (c: CreateCommentProps) => {
  const [commentText, setCommentText] = useState("");
  const { scaSigner } = useSmartAccount();
  const transactor = useSmartTransactor();
  const [isLoading, setIsLoading] = useState(false);
  const contractNames = getContractNames();
  const { data: deployedContractData } = useDeployedContractInfo(contractNames[0]);

  const validateThenWrite = () => {
    if (commentText.trim() === "") {
      notification.warning("Please provide text for this comment.", { position: "top-right", duration: 6000 });
      return;
    }
    sendUserOp();
  };

  const uoCallData = encodeFunctionData({
    abi: [
      {
        inputs: [
          {
            internalType: "bytes",
            name: "_postId",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "_parentCommentId",
            type: "bytes",
          },
          {
            internalType: "string",
            name: "_commentText",
            type: "string",
          },
        ],
        name: "createComment",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    functionName: "createComment",
    args: [c.postId, "0x", commentText],
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
      setCommentText("");
    }
  };

  return (
    <>
      <label className="text-lg font-bold">Comment</label>
      <textarea
        placeholder="Leave your comment..."
        className="px-3 py-3 border rounded-lg bg-base-200 border-base-300 textarea"
        value={commentText}
        onChange={e => setCommentText(e.target.value)}
      />
      <button className="self-end w-2/12 btn btn-primary" onClick={() => validateThenWrite()}>
        {isLoading ? <span className="loading loading-spinner loading-sm"></span> : <>Leave your Comment</>}
      </button>
    </>
  );
};
