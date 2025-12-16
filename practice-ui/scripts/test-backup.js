// Test Database Backup System
const DatabaseBackup = require('./database/backup');

async function testBackupSystem() {
    console.log('🧪 Testing Database Backup System...\n');

    const backup = new DatabaseBackup();

    try {
        // Test 1: Create a manual backup
        console.log('1. Creating manual backup...');
        const manualBackup = await backup.createBackup('test-manual');
        console.log('Result:', manualBackup.success ? '✅ SUCCESS' : '❌ FAILED');
        if (manualBackup.success) {
            console.log(`   Created: ${manualBackup.backupName}`);
        }

        // Test 2: List backups
        console.log('\n2. Listing all backups...');
        const backups = await backup.listBackups();
        console.log(`✅ Found ${backups.length} backups`);
        backups.forEach(b => {
            console.log(`   - ${b.name} (${b.sizeFormatted}, ${b.compressed ? 'compressed' : 'uncompressed'})`);
        });

        // Test 3: Get backup statistics
        console.log('\n3. Getting backup statistics...');
        const stats = await backup.getBackupStats();
        console.log('✅ Backup Statistics:');
        console.log(`   Total backups: ${stats.totalBackups}`);
        console.log(`   Total size: ${stats.totalSizeFormatted}`);
        console.log(`   Average size: ${stats.averageSizeFormatted}`);
        console.log(`   Compressed: ${stats.compressedBackups}, Uncompressed: ${stats.uncompressedBackups}`);

        // Test 4: Verify backup integrity
        if (backups.length > 0) {
            console.log('\n4. Verifying backup integrity...');
            const verification = await backup.verifyBackup(backups[0].name);
            console.log('Result:', verification.valid ? '✅ VALID' : '❌ INVALID');
        }

        // Test 5: Export to SQL
        console.log('\n5. Exporting database to SQL...');
        const sqlExport = await backup.exportToSQL();
        console.log('Result:', sqlExport.success ? '✅ SUCCESS' : '❌ FAILED');
        if (sqlExport.success) {
            console.log(`   Exported: ${sqlExport.sizeFormatted}`);
        }

        console.log('\n🎉 All backup system tests completed!');

        return true;

    } catch (error) {
        console.error('❌ Backup system test failed:', error);
        return false;
    }
}

// Run backup tests
if (require.main === module) {
    testBackupSystem().catch(console.error);
}

module.exports = testBackupSystem;