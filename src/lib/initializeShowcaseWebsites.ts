import { supabase } from '@/integrations/supabase/client';

export const checkIfShowcaseWebsitesTableExists = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('showcase_websites')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.debug('Showcase websites table check error:', {
        code: error.code,
        message: error.message
      });
    }

    // If error code is PGRST116 or message contains "relation" or "showcase_websites", table doesn't exist
    if (error?.code === 'PGRST116' || error?.message?.includes('relation') || error?.message?.includes('showcase_websites')) {
      return false;
    }

    return !error;
  } catch (err) {
    console.error(
      'Unexpected error checking showcase websites table:',
      JSON.stringify({
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      }, null, 2)
    );
    return false;
  }
};

export const initializeShowcaseWebsitesTable = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // First check if table already exists
    const tableExists = await checkIfShowcaseWebsitesTableExists();
    if (tableExists) {
      return {
        success: true,
        message: 'Showcase websites table already exists!',
      };
    }

    // Call the edge function to create the table
    const { data, error } = await supabase.functions.invoke('init-showcase-websites', {
      method: 'POST',
    });

    if (error) {
      console.error(
        'Error invoking init function:',
        JSON.stringify({
          message: error.message || 'Unknown error'
        }, null, 2)
      );
      return {
        success: false,
        message: error.message || 'Failed to initialize showcase websites table. Please try manual setup.',
      };
    }

    if (data?.success) {
      // Wait for the table to be created
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify it was created
      const exists = await checkIfShowcaseWebsitesTableExists();
      if (exists) {
        return {
          success: true,
          message: 'Showcase websites table created successfully!',
        };
      }
    }

    // If we get here, the initialization had an issue
    return {
      success: false,
      message: data?.message || 'Could not create table. Please use manual setup.',
    };
  } catch (err) {
    console.error(
      'Unexpected error initializing showcase websites table:',
      JSON.stringify({
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      }, null, 2)
    );
    return {
      success: false,
      message: err instanceof Error ? err.message : 'An unexpected error occurred. Please try manual setup.',
    };
  }
};
