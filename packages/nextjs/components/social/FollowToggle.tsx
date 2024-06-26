import { useEffect } from "react";
import { FollowButton } from "./FollowButton";
import { UnfollowButton } from "./UnfollowButton";
import { useQuery } from "@apollo/client";
import { GQL_SOCIAL_FOLLOWERS_By_FundRunId_and_Address } from "~~/helpers/getQueries";
import { useSmartAccount } from "~~/hooks/burnerWallet/useSmartAccount";

interface FollowToggleProps {
  fundRunId: number;
}

export const FollowToggle = (fundRun: FollowToggleProps) => {
  const { scaAddress } = useSmartAccount();
  const { error, data } = useQuery(GQL_SOCIAL_FOLLOWERS_By_FundRunId_and_Address(), {
    variables: {
      fundRunId: fundRun.fundRunId,
      user: scaAddress,
    },
    pollInterval: 5000,
  });

  useEffect(() => {
    if (error !== undefined && error !== null)
      console.log("GQL_SOCIAL_FOLLOWERS_By_FundRunId_and_Address Query Error: ", error);
  }, [error]);

  if (data?.fundRuns?.length > 0)
    if (data?.fundRuns[0].followers?.length > 0) return <UnfollowButton fundRunId={fundRun.fundRunId} />;
    else return <FollowButton fundRunId={fundRun.fundRunId} />;
};