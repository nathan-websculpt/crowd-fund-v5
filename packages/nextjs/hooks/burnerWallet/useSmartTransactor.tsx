//looking at: https://github.com/technophile-04/smart-wallet/blob/main/packages/nextjs/hooks/burnerWallet/useSmartTrsansactor.tsx
import { useSmartAccount } from "./useSmartAccount";
import { SendUserOperationResult } from "@alchemy/aa-core";
import { WriteContractResult, getPublicClient } from "@wagmi/core";
import { Hash, TransactionReceipt } from "viem";
import { getParsedError } from "~~/components/scaffold-eth/Contract/utilsContract";
import { getBlockExplorerTxLink, getUserOpExplorerTxLink, notification } from "~~/utils/scaffold-eth";

type TransactionFunc = (
  tx: () => Promise<SendUserOperationResult | `0x${string}`>,

  options?: {
    onBlockConfirmation?: (txnReceipt: TransactionReceipt) => void;
    blockConfirmations?: number;
  },
) => Promise<Hash | undefined>;

/**
 * Custom notification content for TXs.
 */
export const TxnNotification = ({
  message,
  blockExplorerLink,
  userOpExplorerLink,
}: {
  message: string;
  blockExplorerLink?: string;
  userOpExplorerLink?: string;
}) => {
  return (
    <div className={`flex flex-col ml-1 cursor-default`}>
      <p className="my-0">{message}</p>
      {blockExplorerLink && blockExplorerLink.length > 0 ? (
        <a href={blockExplorerLink} target="_blank" rel="noreferrer" className="block link text-md">
          check out transaction
        </a>
      ) : null}
      {userOpExplorerLink && userOpExplorerLink.length > 0 ? (
        <a href={userOpExplorerLink} target="_blank" rel="noreferrer" className="block link text-md">
          inspect userOp
        </a>
      ) : null}
    </div>
  );
};

/**
 * Runs Transaction passed in to returned function showing UI feedback.
 * @param _walletClient - Optional wallet client to use. If not provided, will use the one from useWalletClient.
 * @returns function that takes in transaction function as callback, shows UI feedback for transaction and returns a promise of the transaction hash
 */
export const useSmartTransactor = (): TransactionFunc => {
  const { provider } = useSmartAccount();

  const result: TransactionFunc = async (tx, options) => {
    let notificationId = null;
    let userOpHash: Awaited<WriteContractResult>["hash"] | undefined = undefined;
    try {
      const network = 11155111; //TODO: Get chain id in a way that doesn't use wagmi/useWalletClient

      // Get full transaction from public client
      const publicClient = getPublicClient();

      if (typeof tx === "function") {
        // Tx is already prepared by the caller
        const result = await tx();
        if (typeof result === "string") {
          userOpHash = result;
        } else {
          userOpHash = result.hash;
        }
      } else {
        throw new Error("Incorrect transaction passed to transactor");
      }
      const userOpTxnURL = network ? getUserOpExplorerTxLink(network, userOpHash) : "";

      notificationId = notification.loading(
        <TxnNotification message="Waiting for transaction to complete." userOpExplorerLink={userOpTxnURL} />,
      );

      const txnHash = await provider.waitForUserOperationTransaction(userOpHash);
      const blockExplorerTxURL = network ? getBlockExplorerTxLink(network, txnHash) : "";

      let transactionReceipt;

      if (options?.blockConfirmations) {
        transactionReceipt = await publicClient.waitForTransactionReceipt({
          hash: txnHash,
          confirmations: options?.blockConfirmations,
        });
      }

      notification.remove(notificationId);

      notification.success(
        <TxnNotification
          message="Transaction completed successfully!"
          blockExplorerLink={blockExplorerTxURL}
          userOpExplorerLink={userOpTxnURL}
        />,
        {
          icon: "🎉",
          duration: Infinity,
        },
      );
      if (options?.onBlockConfirmation && transactionReceipt) options.onBlockConfirmation(transactionReceipt);
    } catch (error: any) {
      if (notificationId) {
        notification.remove(notificationId);
      }
      console.error("⚡️ ~ file: useSmartTransactor.ts ~ error from TRY/CATCH", error);
      const message = getParsedError(error);
      notification.error(message);
      notification.error("Please try again");
    }

    return userOpHash;
  };

  return result;
};
