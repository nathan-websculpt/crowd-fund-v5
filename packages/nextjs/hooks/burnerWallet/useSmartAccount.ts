//looking at: https://github.com/technophile-04/smart-wallet/blob/main/packages/nextjs/hooks/burnerWallet/useSmartAccount.ts
//and:        https://magic.link/posts/alchemy-account-abstraction-guide
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTargetNetwork } from "../scaffold-eth/useTargetNetwork";
import { LightSmartContractAccount, getDefaultLightAccountFactoryAddress } from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  Address,
  LocalAccountSigner,
  SmartAccountSigner,
  WalletClientSigner,
  getDefaultEntryPointAddress,
} from "@alchemy/aa-core";
import { createWalletClient, custom, http } from "viem";
import scaffoldConfig from "~~/scaffold.config";
import { loadBurnerSK } from "../scaffold-eth";
// import { dynamicSigner } from "../dynamic/dynamic";

const burnerPK = loadBurnerSK();
const burnerSigner = LocalAccountSigner.privateKeyToAccountSigner(burnerPK);

//provider is an AlchemyProvider
//connectedProvider is an new LightSmartContractAccount

export const useSmartAccount = () => {
  const [scaAddress, setScaAddress] = useState<Address>();
  const [scaSigner, setScaSigner] = useState<AlchemyProvider>();
  const [smartWalletSigner, setSmartWalletSigner] = useState<SmartAccountSigner>();
  const { targetNetwork: chain } = useTargetNetwork();

  const [provider, setProvider] = useState<AlchemyProvider>(
    new AlchemyProvider({
      chain: chain,
      entryPointAddress: getDefaultEntryPointAddress(chain),
      apiKey: scaffoldConfig.alchemyApiKey,
      opts: {
        txMaxRetries: 20,
        txRetryIntervalMs: 2_000,
        txRetryMulitplier: 1.2,
      },
    }),
  );



  const connectToSmartContractAccount = useCallback(() => {
    if (!provider) return;
    if(!provider.account?.owner?.inner?.account) {console.log("No account found."); return;}
    const connectedProvider = provider.connect(provider => {
      return new LightSmartContractAccount({
        rpcClient: provider,
        owner: burnerSigner,
        chain,
        entryPointAddress: getDefaultEntryPointAddress(chain), //TODO: this must have to change when a Gas Manager is used?
        factoryAddress: getDefaultLightAccountFactoryAddress(chain),
      });
    });

    setScaSigner(connectedProvider);
    setSmartWalletSigner(connectedProvider);

    setProvider(connectedProvider);

    return connectedProvider;
  }, [provider]);

  useEffect(() => {
    if (!provider) return;
    // if (!dynamicSigner) return;
    //connectToSmartContractAccount();
  }, [provider]);

  return { provider, scaSigner, scaAddress, smartWalletSigner };
};
