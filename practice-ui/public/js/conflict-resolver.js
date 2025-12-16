// Conflict Resolution Manager
// Handles conflicts between offline and online data
// Interview Prep Platform - Progressive Web App
// Created: December 15, 2025

class ConflictResolver {
    constructor(offlineStorage) {
        this.offlineStorage = offlineStorage;
        this.conflictStrategies = {
            progress: 'merge_latest_wins',
            settings: 'user_choice',
            questions: 'server_wins',
            tracks: 'server_wins'
        };
        this.pendingConflicts = [];
        this.conflictQueue = [];
    }

    // ===================================
    // CONFLICT DETECTION
    // ===================================

    async detectConflicts(dataType, localData, serverData) {
        if (!localData || !serverData) {
            return null;
        }

        const conflicts = [];

        switch (dataType) {
            case 'progress':
                conflicts.push(...this.detectProgressConflicts(localData, serverData));
                break;
            case 'settings':
                conflicts.push(...this.detectSettingsConflicts(localData, serverData));
                break;
            default:
                console.log(`No conflict detection implemented for type: ${dataType}`);
        }

        return conflicts.length > 0 ? conflicts : null;
    }

    detectProgressConflicts(localProgress, serverProgress) {
        const conflicts = [];

        // Check timestamp conflicts
        if (localProgress.lastModified && serverProgress.lastModified) {
            const localTime = new Date(localProgress.lastModified);
            const serverTime = new Date(serverProgress.lastModified);

            // If both have been modified recently and differ, it's a conflict
            if (Math.abs(localTime - serverTime) > 5000) { // 5 second threshold
                if (this.hasProgressDifferences(localProgress, serverProgress)) {
                    conflicts.push({
                        type: 'progress',
                        field: 'general',
                        localValue: localProgress,
                        serverValue: serverProgress,
                        localTimestamp: localProgress.lastModified,
                        serverTimestamp: serverProgress.lastModified,
                        severity: 'high'
                    });
                }
            }
        }

        // Check specific field conflicts
        const progressFields = ['completedDays', 'currentStreak', 'totalStudyTime'];
        progressFields.forEach(field => {
            if (localProgress[field] !== serverProgress[field]) {
                conflicts.push({
                    type: 'progress',
                    field,
                    localValue: localProgress[field],
                    serverValue: serverProgress[field],
                    localTimestamp: localProgress.lastModified,
                    serverTimestamp: serverProgress.lastModified,
                    severity: 'medium'
                });
            }
        });

        return conflicts;
    }

    detectSettingsConflicts(localSettings, serverSettings) {
        const conflicts = [];

        // Check each setting for conflicts
        const settingsToCheck = ['theme', 'notifications', 'display', 'study'];

        settingsToCheck.forEach(category => {
            if (localSettings[category] && serverSettings[category]) {
                const localCat = localSettings[category];
                const serverCat = serverSettings[category];

                Object.keys(localCat).forEach(key => {
                    if (localCat[key] !== serverCat[key]) {
                        conflicts.push({
                            type: 'settings',
                            field: `${category}.${key}`,
                            localValue: localCat[key],
                            serverValue: serverCat[key],
                            localTimestamp: localSettings.lastModified,
                            serverTimestamp: serverSettings.lastModified,
                            severity: 'low'
                        });
                    }
                });
            }
        });

        return conflicts;
    }

    hasProgressDifferences(local, server) {
        const importantFields = ['completedDays', 'currentStreak', 'longestStreak', 'totalStudyTime'];

        return importantFields.some(field => {
            const localVal = JSON.stringify(local[field] || {});
            const serverVal = JSON.stringify(server[field] || {});
            return localVal !== serverVal;
        });
    }

    // ===================================
    // CONFLICT RESOLUTION
    // ===================================

    async resolveConflicts(dataType, conflicts) {
        const strategy = this.conflictStrategies[dataType] || 'server_wins';
        const resolved = [];

        for (const conflict of conflicts) {
            const resolution = await this.resolveConflict(conflict, strategy);
            resolved.push(resolution);
        }

        return resolved;
    }

    async resolveConflict(conflict, strategy) {
        console.log(`🔄 Resolving ${conflict.type} conflict with strategy: ${strategy}`);

        switch (strategy) {
            case 'server_wins':
                return this.resolveServerWins(conflict);

            case 'local_wins':
                return this.resolveLocalWins(conflict);

            case 'merge_latest_wins':
                return this.resolveLatestWins(conflict);

            case 'merge_both':
                return this.resolveMergeBoth(conflict);

            case 'user_choice':
                return this.resolveUserChoice(conflict);

            default:
                console.warn(`Unknown strategy: ${strategy}, defaulting to server_wins`);
                return this.resolveServerWins(conflict);
        }
    }

    resolveServerWins(conflict) {
        console.log(`✅ Server wins for ${conflict.field}`);
        return {
            field: conflict.field,
            resolvedValue: conflict.serverValue,
            strategy: 'server_wins',
            timestamp: new Date().toISOString()
        };
    }

    resolveLocalWins(conflict) {
        console.log(`✅ Local wins for ${conflict.field}`);
        return {
            field: conflict.field,
            resolvedValue: conflict.localValue,
            strategy: 'local_wins',
            timestamp: new Date().toISOString()
        };
    }

    resolveLatestWins(conflict) {
        const localTime = new Date(conflict.localTimestamp || 0);
        const serverTime = new Date(conflict.serverTimestamp || 0);

        const useLocal = localTime > serverTime;
        const resolvedValue = useLocal ? conflict.localValue : conflict.serverValue;

        console.log(`✅ Latest wins (${useLocal ? 'local' : 'server'}) for ${conflict.field}`);

        return {
            field: conflict.field,
            resolvedValue,
            strategy: 'latest_wins',
            winner: useLocal ? 'local' : 'server',
            timestamp: new Date().toISOString()
        };
    }

    async resolveMergeBoth(conflict) {
        let mergedValue;

        try {
            if (conflict.type === 'progress' && conflict.field === 'general') {
                mergedValue = this.mergeProgressData(conflict.localValue, conflict.serverValue);
            } else if (conflict.type === 'settings') {
                mergedValue = this.mergeSettings(conflict.localValue, conflict.serverValue);
            } else {
                // For simple values, use latest timestamp
                return this.resolveLatestWins(conflict);
            }

            console.log(`✅ Merged both values for ${conflict.field}`);

            return {
                field: conflict.field,
                resolvedValue: mergedValue,
                strategy: 'merge_both',
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error(`❌ Failed to merge ${conflict.field}:`, error);
            // Fallback to latest wins
            return this.resolveLatestWins(conflict);
        }
    }

    async resolveUserChoice(conflict) {
        // Add to pending conflicts for user resolution
        this.pendingConflicts.push(conflict);

        console.log(`⏳ User choice needed for ${conflict.field}`);

        // Show conflict resolution UI
        this.showConflictResolutionUI(conflict);

        return {
            field: conflict.field,
            resolvedValue: null,
            strategy: 'user_choice',
            status: 'pending',
            timestamp: new Date().toISOString()
        };
    }

    // ===================================
    // DATA MERGING STRATEGIES
    // ===================================

    mergeProgressData(local, server) {
        const merged = { ...server }; // Start with server data

        // Merge completed days (union of both)
        if (local.completedDays && server.completedDays) {
            merged.completedDays = { ...server.completedDays, ...local.completedDays };
        }

        // Use higher streak values
        if (local.currentStreak > (server.currentStreak || 0)) {
            merged.currentStreak = local.currentStreak;
        }
        if (local.longestStreak > (server.longestStreak || 0)) {
            merged.longestStreak = local.longestStreak;
        }

        // Add study times
        if (local.totalStudyTime && server.totalStudyTime) {
            merged.totalStudyTime = Math.max(local.totalStudyTime, server.totalStudyTime);
        }

        // Merge study sessions (combine unique sessions)
        if (local.studySessions && server.studySessions) {
            const allSessions = [...(server.studySessions || []), ...(local.studySessions || [])];
            merged.studySessions = this.deduplicateStudySessions(allSessions);
        }

        // Merge questions studied (union)
        if (local.questionsStudied && server.questionsStudied) {
            const allQuestions = [...(server.questionsStudied || []), ...(local.questionsStudied || [])];
            merged.questionsStudied = [...new Set(allQuestions)];
        }

        // Use latest timestamp
        merged.lastModified = new Date().toISOString();

        return merged;
    }

    mergeSettings(local, server) {
        const merged = { ...server };

        // For user preferences, prefer local settings
        const localPrefFields = ['theme', 'notifications', 'display', 'study'];

        localPrefFields.forEach(field => {
            if (local[field]) {
                merged[field] = { ...server[field], ...local[field] };
            }
        });

        merged.lastModified = new Date().toISOString();
        return merged;
    }

    deduplicateStudySessions(sessions) {
        const seen = new Set();
        return sessions.filter(session => {
            const key = `${session.date}_${session.duration}_${session.type}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    // ===================================
    // CONFLICT RESOLUTION UI
    // ===================================

    showConflictResolutionUI(conflict) {
        // Create conflict resolution modal
        const modal = document.createElement('div');
        modal.className = 'conflict-resolution-modal';
        modal.innerHTML = `
            <div class="conflict-modal-content">
                <div class="conflict-header">
                    <h3>🔀 Data Conflict Detected</h3>
                    <p>We found conflicting data for <strong>${conflict.field}</strong>. Please choose how to resolve it:</p>
                </div>

                <div class="conflict-options">
                    <div class="conflict-option">
                        <h4>📱 Local Version (Your Device)</h4>
                        <pre>${JSON.stringify(conflict.localValue, null, 2)}</pre>
                        <small>Last modified: ${conflict.localTimestamp}</small>
                        <button class="btn-resolve" data-choice="local">Use This Version</button>
                    </div>

                    <div class="conflict-option">
                        <h4>☁️ Server Version (Cloud)</h4>
                        <pre>${JSON.stringify(conflict.serverValue, null, 2)}</pre>
                        <small>Last modified: ${conflict.serverTimestamp}</small>
                        <button class="btn-resolve" data-choice="server">Use This Version</button>
                    </div>

                    <div class="conflict-option">
                        <h4>🔀 Merge Both</h4>
                        <p>Attempt to merge both versions intelligently</p>
                        <button class="btn-resolve" data-choice="merge">Merge Versions</button>
                    </div>
                </div>

                <div class="conflict-actions">
                    <button class="btn-resolve-later">Resolve Later</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        modal.querySelectorAll('.btn-resolve').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const choice = e.target.dataset.choice;
                this.resolveUserConflict(conflict, choice);
                document.body.removeChild(modal);
            });
        });

        modal.querySelector('.btn-resolve-later').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    async resolveUserConflict(conflict, choice) {
        let resolution;

        switch (choice) {
            case 'local':
                resolution = this.resolveLocalWins(conflict);
                break;
            case 'server':
                resolution = this.resolveServerWins(conflict);
                break;
            case 'merge':
                resolution = await this.resolveMergeBoth(conflict);
                break;
            default:
                console.error('Invalid user choice:', choice);
                return;
        }

        // Remove from pending conflicts
        const index = this.pendingConflicts.indexOf(conflict);
        if (index > -1) {
            this.pendingConflicts.splice(index, 1);
        }

        // Apply the resolution
        await this.applyResolution(conflict.type, resolution);

        console.log(`✅ User resolved conflict for ${conflict.field} with choice: ${choice}`);
    }

    // ===================================
    // CONFLICT APPLICATION
    // ===================================

    async applyResolution(dataType, resolution) {
        try {
            switch (dataType) {
                case 'progress':
                    await this.applyProgressResolution(resolution);
                    break;
                case 'settings':
                    await this.applySettingsResolution(resolution);
                    break;
                default:
                    console.warn(`No application method for type: ${dataType}`);
            }
        } catch (error) {
            console.error(`❌ Failed to apply resolution for ${dataType}:`, error);
        }
    }

    async applyProgressResolution(resolution) {
        if (resolution.field === 'general') {
            // Update entire progress object
            await this.offlineStorage.putInStore('progress', {
                id: 'user_progress',
                data: resolution.resolvedValue,
                resolvedAt: resolution.timestamp
            });
        } else {
            // Update specific field
            const currentProgress = await this.offlineStorage.getFromStore('progress', 'user_progress');
            if (currentProgress) {
                currentProgress.data[resolution.field] = resolution.resolvedValue;
                currentProgress.lastModified = resolution.timestamp;
                await this.offlineStorage.putInStore('progress', currentProgress);
            }
        }
    }

    async applySettingsResolution(resolution) {
        const currentSettings = await this.offlineStorage.getFromStore('settings', 'user_settings');
        if (currentSettings) {
            if (resolution.field.includes('.')) {
                // Nested setting like 'theme.mode'
                const [category, key] = resolution.field.split('.');
                if (!currentSettings.data[category]) {
                    currentSettings.data[category] = {};
                }
                currentSettings.data[category][key] = resolution.resolvedValue;
            } else {
                // Top-level setting
                currentSettings.data[resolution.field] = resolution.resolvedValue;
            }

            currentSettings.lastModified = resolution.timestamp;
            await this.offlineStorage.putInStore('settings', currentSettings);
        }
    }

    // ===================================
    // CONFLICT UTILITIES
    // ===================================

    hasPendingConflicts() {
        return this.pendingConflicts.length > 0;
    }

    getPendingConflicts() {
        return [...this.pendingConflicts];
    }

    async clearResolvedConflicts() {
        this.pendingConflicts = [];
        console.log('🧹 Cleared resolved conflicts');
    }

    // Set conflict resolution strategy for a data type
    setStrategy(dataType, strategy) {
        this.conflictStrategies[dataType] = strategy;
        console.log(`⚙️ Set ${dataType} conflict strategy to: ${strategy}`);
    }

    // Get current strategy for a data type
    getStrategy(dataType) {
        return this.conflictStrategies[dataType] || 'server_wins';
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.ConflictResolver = ConflictResolver;
}