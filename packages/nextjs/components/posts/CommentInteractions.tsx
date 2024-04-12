import { useState } from "react";
import { Address } from "../scaffold-eth/Address";
import { CommentLikeButton } from "./CommentLikeButton";
import { useAccount } from "wagmi";
import { useDeployedContractInfo, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { useSmartAccount } from "~~/hooks/burnerWallet/useSmartAccount";
import { useSmartTransactor } from "~~/hooks/burnerWallet/useSmartTransactor";
import { getContractNames } from "~~/utils/scaffold-eth/contractNames";
import { encodeFunctionData } from "viem";

interface CommentProps {
  postId: string;
  commentId: string;
  commenter: string;
  likeCount: number;
  userHasLiked: boolean;
}

export const CommentInteractions = (c: CommentProps) => {
  const userAccount = useAccount();
  const [showReply, setShowReply] = useState(false);
  const [thisCommentsText, setThisCommentsText] = useState("");
  const { scaSigner } = useSmartAccount();
  const transactor = useSmartTransactor();
  const [isLoading, setIsLoading] = useState(false);
  const contractNames = getContractNames();
  const { data: deployedContractData } = useDeployedContractInfo(contractNames[0]);

  const validateThenWrite = () => {
    if (thisCommentsText.trim() === "") {
      notification.warning("Please provide text for this comment.", { position: "top-right", duration: 6000 });
      return;
    }
    sendUserOp();
  };

  useScaffoldEventSubscriber({
    contractName: "CrowdFund",
    eventName: "Comment",
    listener: logs => {
      logs.map(log => {
        const { commenter } = log.args;
        if (userAccount.address === commenter) {
          setThisCommentsText("");
          setShowReply(false);
        }
      });
    },
  });

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
    args: [c.postId, c.commentId, thisCommentsText],
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
      <div className="flex flex-row items-center justify-between gap-2 top-20">
        {/* This is the "comment" icon, it is currently a custom color, because I needed something that works with both light and dark themes */}
        <div className="flex flex-row">
          <div className="flex flex-row items-center gap-2 cursor-pointer" onClick={() => setShowReply(!showReply)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="#0b70ab"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M3 20l1.3 -3.9a9 8 0 1 1 3.4 2.9l-4.7 1" />
            </svg>
            <p className="font-mono text-sm font-bold">Reply</p>
          </div>

          <CommentLikeButton
            postId={c.postId}
            commentId={c.commentId}
            likeCount={c.likeCount}
            userHasLiked={c.userHasLiked}
          />
        </div>

        <div className="flex flex-col items-end">
          <label className="font-mono text-sm font-bold">Posted By:</label>
          <Address address={c.commenter} size="sm" />
        </div>
      </div>
      <div className="flex flex-col">
        {showReply && (
          <>
            <div className="flex flex-col mt-4">
              <textarea
                placeholder="Leave your reply..."
                className="px-3 py-3 border rounded-lg bg-base-200 border-base-300 textarea"
                value={thisCommentsText}
                onChange={e => setThisCommentsText(e.target.value)}
              />
              <button className="w-20 mt-2 btn btn-primary place-self-end" onClick={() => validateThenWrite()}>
                {isLoading ? <span className="loading loading-spinner loading-sm"></span> : <>Reply</>}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};
