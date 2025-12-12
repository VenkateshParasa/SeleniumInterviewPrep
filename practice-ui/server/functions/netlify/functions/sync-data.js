/**
 * Netlify Function: Data Sync
 * Handles saving and loading user data to/from Netlify Blobs
 * No authentication required - uses device ID for identification
 */

import { getStore } from '@netlify/blobs';

export default async (req, context) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ 
            success: false, 
            error: 'Method not allowed' 
        }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // Parse request body
        const { deviceId, action, data } = await req.json();

        // Validate device ID
        if (!deviceId || typeof deviceId !== 'string' || !deviceId.startsWith('device_')) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'Invalid device ID format' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get Netlify Blobs store
        const store = getStore('interview-prep-data');
        const key = `user_data_${deviceId}`;

        // Handle SAVE action
        if (action === 'save') {
            if (!data) {
                return new Response(JSON.stringify({ 
                    success: false, 
                    error: 'No data provided' 
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // Prepare data for storage
            const storageData = {
                progress: data.progress || {},
                dashboardData: data.dashboardData || {},
                settings: data.settings || {},
                lastSync: new Date().toISOString(),
                deviceId: deviceId
            };

            // Save to Netlify Blobs
            await store.set(key, JSON.stringify(storageData));

            console.log(`✅ Data saved for device: ${deviceId}`);

            return new Response(JSON.stringify({ 
                success: true, 
                message: 'Data synced to cloud successfully',
                lastSync: storageData.lastSync
            }), {
                status: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Handle LOAD action
        if (action === 'load') {
            // Retrieve data from Netlify Blobs
            const cloudData = await store.get(key);

            if (!cloudData) {
                return new Response(JSON.stringify({ 
                    success: false, 
                    message: 'No cloud data found for this device',
                    isNewDevice: true
                }), {
                    status: 404,
                    headers: { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }

            // Parse and return data
            const parsedData = JSON.parse(cloudData);

            console.log(`✅ Data loaded for device: ${deviceId}`);

            return new Response(JSON.stringify({ 
                success: true,
                data: parsedData,
                message: 'Data loaded from cloud successfully'
            }), {
                status: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Handle LIST action (optional - for debugging)
        if (action === 'list') {
            const metadata = await store.getMetadata(key);
            
            return new Response(JSON.stringify({ 
                success: true,
                metadata: metadata || null
            }), {
                status: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Invalid action
        return new Response(JSON.stringify({ 
            success: false, 
            error: 'Invalid action. Use "save" or "load"' 
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('❌ Sync error:', error);

        return new Response(JSON.stringify({ 
            success: false, 
            error: 'Internal server error',
            details: error.message
        }), {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
};

// Configure function
export const config = {
    path: '/sync-data'
};