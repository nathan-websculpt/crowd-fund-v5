//NOTE: using for reference _> https://github.com/technophile-04/smart-wallet/
import Link from "next/link";
import { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { EntryPoint } from "~~/components/crowdfund/EntryPoint";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useSmartAccount } from "~~/hooks/burnerWallet/useSmartAccount";

const Entry: NextPage = () => {
  const { scaAddress, scaSigner } = useSmartAccount();
  return (
    <>
      <MetaHeader title="Crowd Fund | a Scaffold-ETH 2 App" />
      <div className="px-6 pt-10 pb-8 shadow-xl sm:my-auto bg-secondary sm:mx-auto sm:max-w-11/12 md:w-9/12 sm:rounded-lg sm:px-10">
        <div className="flex items-center justify-center">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-5">
            <div className="flex flex-col items-center">
              {scaAddress ? (
                <>
                  <p className="text-5xl">🎉 Abstracted Account 🎉</p>
                  <p className="text-3xl">⚡️NEW: Smart Contract Account Address ⚡️</p>
                  <p className="mb-8 text-xl">🔥 Don't forget to send some funds to your new address for gas 🔥</p>
                  <Address address={scaAddress} size="lg" />
                  <div className="flex items-center gap-1">
                    <span className="text-xl font-semibold">Balance:</span>
                    <Balance address={scaAddress} className="px-0 py-0 text-lg" />
                  </div>
                </>
              ) : (
                <>
                  <h1>Uh oh ... No Smart-Contract-Account Found...</h1>
                </>
              )}
              <div className="mt-7">
                <EntryPoint />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pt-10 pb-8 shadow-xl sm:my-auto bg-secondary sm:mx-auto sm:max-w-11/12 md:w-9/12 sm:w-11/12 sm:rounded-lg sm:px-10">
        <div className="flex justify-evenly">
          <Link href="/social-management/0" passHref className="btn btn-sm btn-primary">
            social media manager
          </Link>
          <Link href="/social/0" passHref className="btn btn-sm btn-primary">
            fund run social media
          </Link>
        </div>
      </div>
    </>
  );
};

export default Entry;
