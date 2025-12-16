// Questions Database Optimization Script
// This script analyzes and optimizes the questions database

const fs = require('fs');
const path = require('path');

const questionsDir = '/Users/venkateshparasa/Desktop/Interview-Prep-Java-Selenium-API/practice-ui/public/data/questions/';

// Read and analyze all question files
async function analyzeQuestionsDatabase() {
    console.log('📊 ANALYZING QUESTIONS DATABASE...\n');

    const files = fs.readdirSync(questionsDir).filter(f => f.endsWith('.json'));

    let totalQuestions = 0;
    let totalSize = 0;
    let allQuestions = [];
    let duplicates = [];

    for (const file of files) {
        const filePath = path.join(questionsDir, file);
        const stats = fs.statSync(filePath);
        const size = stats.size;
        totalSize += size;

        console.log(`📄 ${file}`);
        console.log(`   Size: ${(size / 1024).toFixed(1)}KB`);

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);

            if (data.categories) {
                let fileQuestions = 0;
                data.categories.forEach(category => {
                    if (category.questions) {
                        fileQuestions += category.questions.length;
                        // Add questions to analysis
                        category.questions.forEach(q => {
                            allQuestions.push({
                                id: q.id,
                                question: q.question,
                                file: file,
                                category: category.id
                            });
                        });
                    }
                });
                console.log(`   Questions: ${fileQuestions}`);
                totalQuestions += fileQuestions;
            }
        } catch (error) {
            console.log(`   ❌ Error reading file: ${error.message}`);
        }
        console.log('');
    }

    console.log(`📈 SUMMARY:`);
    console.log(`   Total files: ${files.length}`);
    console.log(`   Total size: ${(totalSize / 1024).toFixed(1)}KB`);
    console.log(`   Total questions: ${totalQuestions}`);
    console.log('');

    // Find duplicates
    console.log('🔍 CHECKING FOR DUPLICATES...');
    const questionTexts = new Map();
    const questionIds = new Map();

    allQuestions.forEach(q => {
        // Check duplicate question text
        if (questionTexts.has(q.question)) {
            duplicates.push({
                type: 'text',
                question: q.question,
                files: [questionTexts.get(q.question), q.file]
            });
        } else {
            questionTexts.set(q.question, q.file);
        }

        // Check duplicate IDs
        if (questionIds.has(q.id)) {
            duplicates.push({
                type: 'id',
                id: q.id,
                files: [questionIds.get(q.id), q.file]
            });
        } else {
            questionIds.set(q.id, q.file);
        }
    });

    console.log(`   Duplicate questions found: ${duplicates.length}`);
    duplicates.slice(0, 5).forEach(dup => {
        console.log(`   - ${dup.type}: ${dup.question || dup.id} (in ${dup.files.join(', ')})`);
    });

    if (duplicates.length > 5) {
        console.log(`   ... and ${duplicates.length - 5} more`);
    }

    // Analyze categories
    console.log('\n📋 CATEGORY ANALYSIS:');
    const categoryStats = {};
    allQuestions.forEach(q => {
        if (!categoryStats[q.category]) {
            categoryStats[q.category] = 0;
        }
        categoryStats[q.category]++;
    });

    Object.entries(categoryStats)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, count]) => {
            console.log(`   ${category}: ${count} questions`);
        });

    return {
        totalFiles: files.length,
        totalSize,
        totalQuestions,
        duplicates: duplicates.length,
        categoryStats
    };
}

// Create optimized questions structure
function createOptimizedStructure() {
    console.log('\n🎯 OPTIMIZATION RECOMMENDATIONS:');

    console.log('1. Remove duplicate files:');
    console.log('   - Keep: interview-questions-fixed.json (6KB, clean)');
    console.log('   - Remove: interview-questions.json (689KB, bloated)');
    console.log('   - Remove: expanded-* files (duplicates)');

    console.log('\n2. Split by category for lazy loading:');
    console.log('   - java-questions.json');
    console.log('   - selenium-questions.json');
    console.log('   - api-testing-questions.json');
    console.log('   - testng-questions.json');
    console.log('   - framework-questions.json');
    console.log('   - leadership-questions.json');

    console.log('\n3. Create question index for search:');
    console.log('   - questions-index.json (lightweight metadata only)');

    console.log('\n4. Implement pagination/lazy loading:');
    console.log('   - Load 20 questions per page');
    console.log('   - Infinite scroll or pagination');

    return true;
}

// Run analysis
analyzeQuestionsDatabase()
    .then(results => {
        createOptimizedStructure();

        console.log('\n✅ Analysis complete!');
        console.log(`💾 Potential savings: ~${((results.totalSize - 6315) / 1024).toFixed(1)}KB by using fixed file only`);
    })
    .catch(error => {
        console.error('❌ Analysis failed:', error);
    });