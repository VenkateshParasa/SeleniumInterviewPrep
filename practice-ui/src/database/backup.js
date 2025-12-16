// Database Backup and Recovery System
// Interview Prep Platform - SQLite Backup Management
// Created: December 15, 2025

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class DatabaseBackup {
    constructor() {
        this.dbPath = path.join(__dirname, 'interview_prep.db');
        this.backupDir = path.join(__dirname, 'backups');
        this.maxBackups = 10; // Keep only 10 most recent backups
        this.compressionEnabled = true;
    }

    // Ensure backup directory exists
    async ensureBackupDirectory() {
        try {
            await fs.mkdir(this.backupDir, { recursive: true });
        } catch (error) {
            console.error('Error creating backup directory:', error);
            throw error;
        }
    }

    // Create a backup with timestamp
    async createBackup(description = 'manual') {
        try {
            console.log('🔄 Creating database backup...');

            await this.ensureBackupDirectory();

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupName = `backup_${timestamp}_${description}`;
            const backupPath = path.join(this.backupDir, `${backupName}.db`);

            // Copy database file
            await fs.copyFile(this.dbPath, backupPath);

            // Compress backup if enabled
            if (this.compressionEnabled) {
                const compressedPath = `${backupPath}.gz`;
                await execAsync(`gzip "${backupPath}"`);
                console.log(`✅ Backup created: ${path.basename(compressedPath)}`);

                return {
                    success: true,
                    backupPath: compressedPath,
                    backupName: `${backupName}.db.gz`,
                    timestamp,
                    description,
                    compressed: true
                };
            } else {
                console.log(`✅ Backup created: ${path.basename(backupPath)}`);

                return {
                    success: true,
                    backupPath,
                    backupName: `${backupName}.db`,
                    timestamp,
                    description,
                    compressed: false
                };
            }

        } catch (error) {
            console.error('❌ Backup creation failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Restore database from backup
    async restoreFromBackup(backupName) {
        try {
            console.log(`🔄 Restoring database from backup: ${backupName}`);

            const backupPath = path.join(this.backupDir, backupName);

            // Check if backup file exists
            try {
                await fs.access(backupPath);
            } catch (error) {
                throw new Error(`Backup file not found: ${backupName}`);
            }

            // Create a backup of current database before restore
            const currentBackup = await this.createBackup('pre-restore');
            console.log('✅ Current database backed up before restore');

            let restorePath = backupPath;

            // Decompress if needed
            if (backupPath.endsWith('.gz')) {
                const decompressedPath = backupPath.replace('.gz', '');
                await execAsync(`gunzip -c "${backupPath}" > "${decompressedPath}"`);
                restorePath = decompressedPath;
                console.log('✅ Backup decompressed');
            }

            // Stop database connections (would need to be implemented in production)
            console.log('⏸️ Stopping database connections...');

            // Replace current database
            await fs.copyFile(restorePath, this.dbPath);

            // Clean up decompressed file if created
            if (restorePath !== backupPath) {
                await fs.unlink(restorePath);
            }

            console.log('✅ Database restored successfully');

            return {
                success: true,
                restoredFrom: backupName,
                currentBackup: currentBackup.backupName
            };

        } catch (error) {
            console.error('❌ Database restore failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // List all available backups
    async listBackups() {
        try {
            await this.ensureBackupDirectory();

            const files = await fs.readdir(this.backupDir);
            const backups = [];

            for (const file of files) {
                if (file.startsWith('backup_') && (file.endsWith('.db') || file.endsWith('.db.gz'))) {
                    const filePath = path.join(this.backupDir, file);
                    const stats = await fs.stat(filePath);

                    // Parse timestamp from filename
                    const match = file.match(/backup_([0-9T-]+)_(.+?)\.db/);
                    const timestamp = match ? match[1] : 'unknown';
                    const description = match ? match[2] : 'unknown';

                    backups.push({
                        name: file,
                        path: filePath,
                        size: stats.size,
                        sizeFormatted: this.formatBytes(stats.size),
                        created: stats.mtime,
                        timestamp,
                        description,
                        compressed: file.endsWith('.gz')
                    });
                }
            }

            // Sort by creation date (newest first)
            backups.sort((a, b) => b.created - a.created);

            return backups;

        } catch (error) {
            console.error('❌ Failed to list backups:', error);
            return [];
        }
    }

    // Clean up old backups (keep only maxBackups)
    async cleanupOldBackups() {
        try {
            console.log('🧹 Cleaning up old backups...');

            const backups = await this.listBackups();

            if (backups.length <= this.maxBackups) {
                console.log(`✅ No cleanup needed (${backups.length}/${this.maxBackups} backups)`);
                return { removed: 0, kept: backups.length };
            }

            const backupsToRemove = backups.slice(this.maxBackups);
            let removedCount = 0;

            for (const backup of backupsToRemove) {
                try {
                    await fs.unlink(backup.path);
                    console.log(`🗑️ Removed old backup: ${backup.name}`);
                    removedCount++;
                } catch (error) {
                    console.error(`❌ Failed to remove backup ${backup.name}:`, error);
                }
            }

            console.log(`✅ Cleanup complete: removed ${removedCount} old backups`);

            return {
                removed: removedCount,
                kept: this.maxBackups
            };

        } catch (error) {
            console.error('❌ Backup cleanup failed:', error);
            return { removed: 0, error: error.message };
        }
    }

    // Automated backup scheduler
    async scheduleAutoBackup(intervalHours = 24) {
        console.log(`📅 Scheduling automatic backups every ${intervalHours} hours`);

        const backupInterval = intervalHours * 60 * 60 * 1000; // Convert to milliseconds

        const performBackup = async () => {
            try {
                console.log('🔄 Performing scheduled backup...');
                const result = await this.createBackup('scheduled');

                if (result.success) {
                    console.log('✅ Scheduled backup completed successfully');

                    // Clean up old backups after successful backup
                    await this.cleanupOldBackups();
                } else {
                    console.error('❌ Scheduled backup failed:', result.error);
                }
            } catch (error) {
                console.error('❌ Scheduled backup error:', error);
            }
        };

        // Perform initial backup
        await performBackup();

        // Schedule recurring backups
        const intervalId = setInterval(performBackup, backupInterval);

        console.log(`✅ Automatic backup scheduled (ID: ${intervalId})`);

        return intervalId;
    }

    // Verify backup integrity
    async verifyBackup(backupName) {
        try {
            console.log(`🔍 Verifying backup integrity: ${backupName}`);

            const backupPath = path.join(this.backupDir, backupName);

            // Check if file exists
            await fs.access(backupPath);

            let testPath = backupPath;

            // Decompress if needed for testing
            if (backupPath.endsWith('.gz')) {
                const tempPath = path.join(this.backupDir, 'temp_verify.db');
                await execAsync(`gunzip -c "${backupPath}" > "${tempPath}"`);
                testPath = tempPath;
            }

            // Test SQLite integrity
            const { stdout, stderr } = await execAsync(`sqlite3 "${testPath}" "PRAGMA integrity_check;"`);

            // Clean up temp file
            if (testPath !== backupPath) {
                await fs.unlink(testPath);
            }

            const isValid = stdout.trim() === 'ok';

            console.log(isValid ? '✅ Backup integrity verified' : '❌ Backup integrity check failed');

            return {
                valid: isValid,
                output: stdout,
                error: stderr
            };

        } catch (error) {
            console.error('❌ Backup verification failed:', error);
            return {
                valid: false,
                error: error.message
            };
        }
    }

    // Get backup statistics
    async getBackupStats() {
        const backups = await this.listBackups();

        const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
        const compressedCount = backups.filter(b => b.compressed).length;
        const uncompressedCount = backups.length - compressedCount;

        return {
            totalBackups: backups.length,
            totalSize: totalSize,
            totalSizeFormatted: this.formatBytes(totalSize),
            compressedBackups: compressedCount,
            uncompressedBackups: uncompressedCount,
            oldestBackup: backups[backups.length - 1]?.created || null,
            newestBackup: backups[0]?.created || null,
            averageSize: backups.length > 0 ? Math.round(totalSize / backups.length) : 0,
            averageSizeFormatted: backups.length > 0 ? this.formatBytes(Math.round(totalSize / backups.length)) : '0 B'
        };
    }

    // Utility function to format bytes
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';

        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Export database to SQL dump (for human-readable backups)
    async exportToSQL(outputPath = null) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const defaultPath = path.join(this.backupDir, `export_${timestamp}.sql`);
            const exportPath = outputPath || defaultPath;

            await this.ensureBackupDirectory();

            console.log('📄 Exporting database to SQL...');

            await execAsync(`sqlite3 "${this.dbPath}" .dump > "${exportPath}"`);

            const stats = await fs.stat(exportPath);

            console.log(`✅ SQL export completed: ${path.basename(exportPath)} (${this.formatBytes(stats.size)})`);

            return {
                success: true,
                path: exportPath,
                size: stats.size,
                sizeFormatted: this.formatBytes(stats.size)
            };

        } catch (error) {
            console.error('❌ SQL export failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = DatabaseBackup;