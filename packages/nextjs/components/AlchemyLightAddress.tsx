import { Balance } from "./scaffold-eth";
import { Address } from "./scaffold-eth/Address";
import { useSmartAccount } from "~~/hooks/burnerWallet/useSmartAccount";

export const AlchemyLightAddress = () => {
  const { scaAddress } = useSmartAccount();

  return (
    <>
      {scaAddress ? (
        <>
          <div className="flex items-center justify-end gap-2 px-2">
            <div className="flex flex-col items-center mr-1">
              <Balance address={scaAddress} className="px-0 py-0 text-lg" />
            </div>
            <div>
              <Address address={scaAddress} size="md" />
            </div>
          </div>
        </>
      ) : (
        <>
          <h1>Uh oh ... No Smart-Contract-Account Found...</h1>
        </>
      )}
    </>
  );
};
