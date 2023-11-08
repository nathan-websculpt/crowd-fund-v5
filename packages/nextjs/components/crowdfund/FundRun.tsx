import { FundRunStatus } from "./FundRunStatus";
import { formatEther } from "viem";

interface DisplayFundRunProps {
  title: string;
  description: string;
  target: bigint;
  deadline: string;
  amountCollected: bigint;
  amountWithdrawn: bigint;
  status: number;
}

export const FundRun = (fund: DisplayFundRunProps) => {
  return (
    <>
      {/* TODO: add ID and Address to top of the Fund Run */}
      <label className="text-sm font-bold underline">Title</label>
      <p className="text-md">{fund.title}</p>

      <label className="text-sm font-bold underline">Description</label>
      <p className="text-md">{fund.description}</p>

      <div className="justify-between lg:px-2 lg:flex lg:flex-row">
        <div className="flex flex-col lg:p-2">
          <label className="text-sm font-bold underline">Money Target</label>
          <p className="break-all text-md">{formatEther(fund.target)}</p>
        </div>

        <div className="flex flex-col mt-4 lg:p-2 lg:mt-0">
          <label className="text-sm font-bold underline">Ether Donated</label>
          <p className="break-all text-md">{formatEther(fund.amountCollected)}</p>
        </div>
      </div>

      <div className="justify-between lg:px-2 lg:flex lg:flex-row">
        <div className="flex flex-col lg:p-2">
          <label className="text-sm font-bold underline">Ether Withdrawn</label>
          <p className="break-all text-md">{formatEther(fund.amountWithdrawn)}</p>
        </div>

        <FundRunStatus status={fund.status} />
      </div>
    </>
  );
};
