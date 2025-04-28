
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAdminCheck = (userId: string | undefined) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!userId) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        // For this example, we're creating a single admin with a specific email
        // In a real app, you would check against a database record
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        } else if (data?.user) {
          // This email will be our admin user
          setIsAdmin(data.user.email === "admin@sparkyai.com");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [userId]);

  return { isAdmin, isLoading };
};
