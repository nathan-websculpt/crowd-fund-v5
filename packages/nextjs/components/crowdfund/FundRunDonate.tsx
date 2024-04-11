import { useState } from "react";
import Link from "next/link";
import { IntegerVariant, isValidInteger } from "../scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { useSmartAccount } from "~~/hooks/burnerWallet/useSmartAccount";
import { getContractNames } from "~~/utils/scaffold-eth/contractNames";
import { encodeFunctionData, parseEther } from "viem";
import { useSmartTransactor } from "~~/hooks/burnerWallet/useSmartTransactor";

interface FundRunProps {
  id: number;
  owners: readonly string[];
}

export const FundRunDonate = (fundRun: FundRunProps) => {
  const [donationInput, setDonationInput] = useState("");
  const { scaAddress, scaSigner } = useSmartAccount();
  const transactor = useSmartTransactor();
  const [isLoading, setIsLoading] = useState(false);
  const contractNames = getContractNames();
  const { data: deployedContractData } = useDeployedContractInfo(contractNames[0]);

  function handleBigIntChange(newVal: string): void {
    const _v = newVal.trim();
    if (_v.length === 0 || _v === "." || isValidInteger(IntegerVariant.UINT256, _v, false)) setDonationInput(_v);
  }

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
    args: [fundRun.id],
    // nonce: 7,
  });

  const sendUserOp = async () => {
    if (!scaSigner) {
      notification.error("Cannot access smart account");
      return;
    }
    setIsLoading(true);
    try {
      const userOperationPromise = scaSigner.sendUserOperation({
        value: parseEther(donationInput),
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

  const validateThenWrite = () => {
    if (donationInput.trim() === "" || donationInput.trim() === ".") {
      notification.warning("Please input a valid donation amount.", { position: "top-right", duration: 6000 });
      return;
    }
    sendUserOp();
  };

  return (
    <>
      <div className="flex gap-1 mt-5">
        <input
          placeholder="Amount EX: 0.1"
          className="w-3/4 input input-bordered input-accent"
          value={donationInput}
          onChange={e => handleBigIntChange(e.target.value)}
        />
        <button className="w-1/4 btn btn-primary" onClick={() => validateThenWrite()} disabled={isLoading}>
          {isLoading ? <span className="loading loading-spinner loading-sm"></span> : <>DONATE</>}
        </button>
      </div>

      <div className="flex flex-col justify-center gap-8 pt-6 mt-8 mb-5 border-t-4 sm:flex-row sm:flex-wrap">
        <Link href={`/crowdfund/vaults/${fundRun.id}`} passHref className="px-12 btn btn-primary">
          <div className="tooltip tooltip-primary" data-tip="View Proposals in the Vault">
            View Vault
          </div>
        </Link>
      </div>
    </>
  );
};
