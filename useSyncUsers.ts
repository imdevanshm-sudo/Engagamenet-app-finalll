// useSyncUsers.ts
import { useEffect, useState, useCallback } from "react";
import {
  saveProfile,
  subscribeProfiles,
  subscribeGlobalConfig,
} from "./firebase";

export default function useSyncUsers() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [globalConfig, setGlobalConfig] = useState<any | null>(null);

  useEffect(() => {
    const unSubProfiles = subscribeProfiles((list) => {
      setProfiles(list);
    });

    const unSubConfig = subscribeGlobalConfig((cfg) => {
      setGlobalConfig(cfg);
      if (cfg) {
        localStorage.setItem("wedding_global_config", JSON.stringify(cfg));
      }
    });

    return () => {
      unSubProfiles();
      unSubConfig();
    };
  }, []);

  const saveProfileCloud = useCallback(async (p: any) => {
    return await saveProfile(p);
  }, []);

  return {
    profiles,
    globalConfig,
    saveProfileCloud,
  };
}
