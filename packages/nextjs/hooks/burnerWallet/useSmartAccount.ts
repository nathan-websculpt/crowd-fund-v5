//looking at: https://github.com/technophile-04/smart-wallet/blob/main/packages/nextjs/hooks/burnerWallet/useSmartAccount.ts
import { useEffect, useMemo, useState } from "react";
import { loadBurnerSK } from "../scaffold-eth";
import { useTargetNetwork } from "../scaffold-eth/useTargetNetwork";
import { LightSmartContractAccount, getDefaultLightAccountFactoryAddress } from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { Address, LocalAccountSigner, WalletClientSigner, getDefaultEntryPointAddress } from "@alchemy/aa-core";
import { createWalletClient, custom, http } from "viem";
import scaffoldConfig from "~~/scaffold.config";

const burnerPK = loadBurnerSK();
const burnerSigner = LocalAccountSigner.privateKeyToAccountSigner(burnerPK);

//provider is an AlchemyProvider
//connectedProvider is an new LightSmartContractAccount

export const useSmartAccount = () => {
  const [scaAddress, setScaAddress] = useState<Address>();
  const [scaSigner, setScaSigner] = useState<AlchemyProvider>();
  const [smartWalletSigner, setSmartWalletSigner] = useState<SmartAccountSigner>();
  const { targetNetwork: chain } = useTargetNetwork();
  const provider = useMemo(
    () =>
      new AlchemyProvider({
        chain: chain,
        apiKey: scaffoldConfig.alchemyApiKey,
        opts: {
          txMaxRetries: 20,
          txRetryIntervalMs: 2_000,
          txRetryMulitplier: 1.2,
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chain.id],
  );

  useEffect(() => {
    const connectedProvider = provider.connect(provider => {
      return new LightSmartContractAccount({
        rpcClient: provider,
        owner: burnerSigner,
        chain,
        entryPointAddress: getDefaultEntryPointAddress(chain), //TODO: this must have to change when a Gas Manager is used?
        factoryAddress: getDefaultLightAccountFactoryAddress(chain),
      });
    });
    const getScaAddress = async () => {
      const address = await connectedProvider.getAddress();
      console.log("🔥 scaAddress", address);
      setScaAddress(address);
    };
    setScaSigner(connectedProvider);
    getScaAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain.id]);

  //adding apr. 15th
  useEffect(() => {
    if (scaAddress !== undefined && scaAddress !== null) {
      //WalletClientSigner
      //The WalletClientSigner is useful if you want to convert a viem WalletClient to a SmartAccountSigner which can be used as a signer to use to connect to Smart Contract Accounts
      //https://accountkit.alchemy.com/packages/aa-core/signers/wallet-client.html#walletclientsigner
      const walletClient = createWalletClient({
        account: scaAddress,
        chain: chain,
        // transport: custom(provider),
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${scaffoldConfig.alchemyApiKey}`),
      });

      const signer: SmartAccountSigner = new WalletClientSigner(
        walletClient,
        "json-rpc", // signerType
      );
      setSmartWalletSigner(signer);
    }
  }, [scaAddress]);
  //END: adding apr. 15th

  return { provider, scaSigner, scaAddress, smartWalletSigner };
};
