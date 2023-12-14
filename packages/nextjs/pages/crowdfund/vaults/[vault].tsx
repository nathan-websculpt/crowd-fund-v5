import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { Spinner } from "~~/components/Spinner";
import { CreateProposal } from "~~/components/crowdfund/proposals/CreateProposal";
import { ProposalTable } from "~~/components/crowdfund/proposals/ProposalTable";
import { GQL_FUNDRUN_BY_ID } from "~~/helpers/getQueries";

const VaultPage: NextPage = () => {
  const router = useRouter();
  const { vault } = router.query as { vault?: `${string}` }; //fundRunId

  const { loading, error, data } = useQuery(GQL_FUNDRUN_BY_ID(), {
    variables: { slug: parseInt(vault) },
  });

  return (
    <>
      <MetaHeader title="Multisig Vault" />
      {data?.fundRuns[0] ? (
        <>
          <div className="px-6 pt-10 pb-8 shadow-xl sm:my-auto bg-secondary sm:mx-auto sm:max-w-11/12 md:w-9/12 sm:rounded-lg sm:px-10">
            <div className="flex items-center justify-center">
              <CreateProposal fundRunId={data?.fundRuns[0].fundRunId} title={data?.fundRuns[0].title} />
            </div>
          </div>

          <ProposalTable fundRunId={data?.fundRuns[0].fundRunId} />
        </>
      ) : (
        <>
          <div className="flex flex-col gap-2 p-2 m-4 mx-auto border shadow-xl border-base-300 bg-base-200 sm:rounded-lg">
            <Spinner width="150px" height="150px" />
          </div>
        </>
      )}
    </>
  );
};

export default VaultPage;
