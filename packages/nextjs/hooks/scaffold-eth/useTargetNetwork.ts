//SE-2 now has the ability to select from multiple networks; this is the file name for that update, without all the bells-and-whistles 

import { useNetwork } from "wagmi";
import { ChainWithAttributes, getTargetNetwork } from "~~/utils/scaffold-eth";
import { NETWORKS_EXTRA_DATA } from "~~/utils/scaffold-eth";

export function useTargetNetwork(): { targetNetwork: ChainWithAttributes } {
  const { chain } = useNetwork();
  const targetNetwork = getTargetNetwork();

  return {
    targetNetwork: {
      ...targetNetwork,
      ...NETWORKS_EXTRA_DATA[targetNetwork.id],
    },
  };
}