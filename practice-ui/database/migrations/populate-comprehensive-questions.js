// Comprehensive Question Population Script
// Parses all documented question banks and populates database
// Target: 1,755+ questions from all documentation sources
// Created: December 19, 2025

const fs = require('fs').promises;
const path = require('path');
const { db } = require('../models');
const { v4: uuidv4 } = require('uuid');

class ComprehensiveQuestionPopulator {
    constructor() {
        this.stats = {
            totalProcessed: 0,
            totalInserted: 0,
            totalSkipped: 0,
            errors: [],
            categoryStats: {},
            startTime: null,
            endTime: null
        };
        
        this.questionSources = [
            {
                file: '../../../docs/question-banks/CONSOLIDATED-SELENIUM-QUESTIONS.md',
                category: 'selenium',
                type: 'consolidated_with_answers'
            },
            {
                file: '../../../docs/question-banks/CONSOLIDATED-API-TESTING-QUESTIONS.md',
                category: 'api-testing',
                type: 'consolidated_with_answers'
            },
            {
                file: '../../../docs/question-banks/comprehensive-banks/JAVA-INTERVIEW-QUESTIONS-BANK.md',
                category: 'java',
                type: 'questions_only'
            },
            {
                file: '../../../docs/question-banks/comprehensive-banks/SELENIUM-INTERVIEW-QUESTIONS-BANK.md',
                category: 'selenium',
                type: 'questions_only'
            },
            {
                file: '../../../docs/question-banks/comprehensive-banks/API-TESTING-INTERVIEW-QUESTIONS-BANK.md',
                category: 'api-testing',
                type: 'questions_only'
            },
            {
                file: '../../../docs/question-banks/comprehensive-banks/SCENARIO-BEHAVIORAL-INTERVIEW-QUESTIONS.md',
                category: 'leadership',
                type: 'questions_only'
            }
        ];
    }

    async populateAllQuestions() {
        console.log('🚀 Starting comprehensive question population...');
        console.log(`📚 Processing ${this.questionSources.length} source files`);
        this.stats.startTime = new Date();

        try {
            // Ensure database connection
            await db.connect();

            // Get all categories
            const categories = await this.getCategories();
            console.log(`📂 Found ${Object.keys(categories).length} categories`);

            // Process each source file
            for (const source of this.questionSources) {
                await this.processSourceFile(source, categories);
            }

            this.stats.endTime = new Date();
            this.printSummary();

        } catch (error) {
            console.error('❌ Population failed:', error);
            throw error;
        }
    }

    async getCategories() {
        const categories = await db.categories.findAll();
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.slug] = cat;
        });
        return categoryMap;
    }

    async processSourceFile(source, categories) {
        const filePath = path.join(__dirname, source.file);
        
        try {
            console.log(`\n📖 Processing: ${source.file}`);
            const content = await fs.readFile(filePath, 'utf8');
            
            const category = categories[source.category];
            if (!category) {
                console.error(`❌ Category '${source.category}' not found`);
                return;
            }

            let questions = [];
            
            if (source.type === 'consolidated_with_answers') {
                questions = this.parseConsolidatedQuestions(content, source.category);
            } else {
                questions = this.parseQuestionBankQuestions(content, source.category);
            }

            console.log(`📝 Found ${questions.length} questions in ${source.file}`);
            
            if (questions.length > 0) {
                await this.insertQuestions(questions, category.id, source.category);
            }

        } catch (error) {
            console.error(`❌ Error processing ${source.file}:`, error.message);
            this.stats.errors.push({
                file: source.file,
                error: error.message
            });
        }
    }

    parseConsolidatedQuestions(content, categorySlug) {
        const questions = [];
        
        // Parse questions with answers from consolidated files
        const questionPattern = /#### (\d+)\.\s*(.+?)\n\*\*Answer\*\*:\s*(.+?)(?=\n\n|\n####|\n---|\n##|$)/gs;
        let match;
        
        while ((match = questionPattern.exec(content)) !== null) {
            const [, questionNumber, questionText, answer] = match;
            
            // Extract difficulty and tags if present
            const difficulty = this.extractDifficulty(answer) || 3;
            const tags = this.extractTags(answer, questionText);
            
            questions.push({
                question_text: questionText.trim(),
                answer: this.cleanAnswer(answer),
                difficulty_level: difficulty,
                question_type: 'theoretical',
                tags: tags,
                estimated_time: this.estimateTime(questionText, answer),
                source: `Consolidated ${categorySlug} Questions`
            });
        }

        // Fallback: try alternative pattern for questions with different formatting
        if (questions.length === 0) {
            const altPattern = /(?:^|\n)(?:\d+\.|\*\*\d+\.\*\*|\#{1,4})\s*(.+?)\n(?:\*\*Answer\*\*:?\s*)?(.+?)(?=\n(?:\d+\.|\*\*\d+\.\*\*|\#{1,4})|\n---|\n##|$)/gs;
            
            while ((match = altPattern.exec(content)) !== null) {
                const [, questionText, answer] = match;
                
                if (questionText && questionText.length > 10 && answer && answer.length > 10) {
                    questions.push({
                        question_text: questionText.trim(),
                        answer: this.cleanAnswer(answer),
                        difficulty_level: 3,
                        question_type: 'theoretical',
                        tags: this.extractTags(answer, questionText),
                        estimated_time: 5,
                        source: `Consolidated ${categorySlug} Questions`
                    });
                }
            }
        }

        return questions;
    }

    parseQuestionBankQuestions(content, categorySlug) {
        const questions = [];
        
        // Parse questions from question bank files (questions only, no answers)
        const questionPattern = /(?:^|\n)(\d+)\.\s*(.+?)(?=\n\d+\.|\n##|\n---|\n$)/gs;
        let match;
        
        while ((match = questionPattern.exec(content)) !== null) {
            const [, questionNumber, questionText] = match;
            
            // Skip if question is too short or looks like a header
            if (questionText.length < 10 || questionText.includes('Questions)') || questionText.includes('Table of Contents')) {
                continue;
            }

            const difficulty = this.inferDifficulty(questionText, parseInt(questionNumber));
            const tags = this.extractTags('', questionText);
            
            questions.push({
                question_text: questionText.trim(),
                answer: null, // No answers in question bank files
                difficulty_level: difficulty,
                question_type: 'theoretical',
                tags: tags,
                estimated_time: this.estimateTime(questionText, ''),
                source: `${categorySlug} Question Bank`
            });
        }

        return questions;
    }

    extractDifficulty(text) {
        // Try to extract difficulty from tags or content
        if (text.includes('Easy') || text.includes('Basic')) return 2;
        if (text.includes('Medium') || text.includes('Intermediate')) return 3;
        if (text.includes('Hard') || text.includes('Advanced')) return 4;
        if (text.includes('Expert') || text.includes('Senior')) return 5;
        return 3; // Default
    }

    inferDifficulty(questionText, questionNumber) {
        // Infer difficulty based on question content and position
        const text = questionText.toLowerCase();
        
        // Basic/Easy questions (usually first 100 questions)
        if (questionNumber <= 100 || 
            text.includes('what is') || 
            text.includes('define') || 
            text.includes('explain the difference between')) {
            return 2;
        }
        
        // Advanced questions (usually after 300)
        if (questionNumber > 300 || 
            text.includes('design') || 
            text.includes('implement') || 
            text.includes('architecture') ||
            text.includes('performance') ||
            text.includes('scalability')) {
            return 4;
        }
        
        // Medium difficulty (default)
        return 3;
    }

    extractTags(answer, questionText) {
        const tags = [];
        const combinedText = (answer + ' ' + questionText).toLowerCase();
        
        // Technology tags
        if (combinedText.includes('java')) tags.push('java');
        if (combinedText.includes('selenium')) tags.push('selenium');
        if (combinedText.includes('api')) tags.push('api');
        if (combinedText.includes('rest')) tags.push('rest');
        if (combinedText.includes('testng')) tags.push('testng');
        if (combinedText.includes('framework')) tags.push('framework');
        if (combinedText.includes('automation')) tags.push('automation');
        
        // Concept tags
        if (combinedText.includes('oop') || combinedText.includes('object-oriented')) tags.push('oop');
        if (combinedText.includes('collection')) tags.push('collections');
        if (combinedText.includes('exception')) tags.push('exception-handling');
        if (combinedText.includes('thread') || combinedText.includes('concurrent')) tags.push('multithreading');
        if (combinedText.includes('wait') || combinedText.includes('synchronization')) tags.push('synchronization');
        if (combinedText.includes('locator')) tags.push('locators');
        if (combinedText.includes('page object')) tags.push('page-object-model');
        if (combinedText.includes('leadership') || combinedText.includes('management')) tags.push('leadership');
        
        return tags.length > 0 ? tags : ['general'];
    }

    cleanAnswer(answer) {
        if (!answer) return null;
        
        return answer
            .replace(/\*\*Answer\*\*:?\s*/g, '')
            .replace(/\*\*Tags:\*\*.*$/gm, '')
            .replace(/\*\*Answer\*\*.*$/gm, '')
            .replace(/```[\s\S]*?```/g, '') // Remove code blocks for now
            .trim();
    }

    estimateTime(questionText, answer) {
        const totalLength = (questionText + (answer || '')).length;
        
        if (totalLength < 100) return 3;
        if (totalLength < 300) return 5;
        if (totalLength < 600) return 7;
        return 10;
    }

    async insertQuestions(questions, categoryId, categoryName) {
        console.log(`📝 Inserting ${questions.length} ${categoryName} questions...`);
        
        let inserted = 0;
        let skipped = 0;
        let errors = 0;

        for (const questionData of questions) {
            try {
                // Check if question already exists (avoid duplicates)
                const existing = await db.db.get(
                    'SELECT id FROM questions WHERE question_text = ? AND category_id = ?',
                    [questionData.question_text, categoryId]
                );

                if (existing) {
                    skipped++;
                    this.stats.totalSkipped++;
                    continue;
                }

                const question = {
                    uuid: uuidv4(),
                    category_id: categoryId,
                    question_text: questionData.question_text,
                    answer: questionData.answer,
                    explanation: questionData.explanation || null,
                    difficulty_level: questionData.difficulty_level || 3,
                    question_type: questionData.question_type || 'theoretical',
                    tags: JSON.stringify(questionData.tags || []),
                    code_snippets: questionData.code_snippets ? JSON.stringify(questionData.code_snippets) : null,
                    related_concepts: questionData.related_concepts ? JSON.stringify(questionData.related_concepts) : null,
                    estimated_time: questionData.estimated_time || 5,
                    source: questionData.source || `Migration Script - ${categoryName}`,
                    is_active: true
                };

                await db.questions.create(question);
                inserted++;
                this.stats.totalInserted++;

            } catch (error) {
                console.error(`❌ Error inserting question: ${questionData.question_text.substring(0, 50)}...`, error.message);
                this.stats.errors.push({
                    question: questionData.question_text.substring(0, 100),
                    error: error.message,
                    category: categoryName
                });
                errors++;
            }
        }

        this.stats.categoryStats[categoryName] = {
            processed: questions.length,
            inserted: inserted,
            skipped: skipped,
            errors: errors
        };

        console.log(`✅ ${categoryName}: ${inserted}/${questions.length} questions inserted (${skipped} skipped, ${errors} errors)`);
    }

    printSummary() {
        const duration = this.stats.endTime - this.stats.startTime;
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);

        console.log('\n🎉 COMPREHENSIVE QUESTION POPULATION COMPLETE!');
        console.log('================================================');
        console.log(`⏱️  Duration: ${minutes}m ${seconds}s`);
        console.log(`📊 Total Inserted: ${this.stats.totalInserted} questions`);
        console.log(`⏭️  Total Skipped: ${this.stats.totalSkipped} questions (duplicates)`);
        console.log(`❌ Total Errors: ${this.stats.errors.length}`);
        console.log('\n📈 Category Breakdown:');
        
        Object.entries(this.stats.categoryStats).forEach(([category, stats]) => {
            console.log(`   ${category}: ${stats.inserted}/${stats.processed} inserted (${stats.skipped} skipped, ${stats.errors} errors)`);
        });

        if (this.stats.errors.length > 0 && this.stats.errors.length <= 10) {
            console.log('\n❌ Error Details:');
            this.stats.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. [${error.category || error.file}] ${error.question || error.error}`);
            });
        } else if (this.stats.errors.length > 10) {
            console.log(`\n❌ ${this.stats.errors.length} errors occurred (too many to display)`);
        }

        console.log('\n🚀 Next Steps:');
        console.log('   1. Verify total question count in database');
        console.log('   2. Test pagination with large dataset');
        console.log('   3. Verify search and filtering functionality');
        console.log('   4. Check category distribution');
        console.log('   5. Monitor database performance');
        console.log('   6. Update frontend for optimal user experience');
    }
}

// Main execution function
async function populateComprehensiveQuestions() {
    const populator = new ComprehensiveQuestionPopulator();
    
    try {
        await populator.populateAllQuestions();
        console.log('✅ Comprehensive question population completed successfully!');
        
        // Show final database stats
        const totalQuestions = await populator.db?.db?.get('SELECT COUNT(*) as count FROM questions WHERE is_active = TRUE');
        if (totalQuestions) {
            console.log(`🎯 Final database count: ${totalQuestions.count} active questions`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Comprehensive question population failed:', error);
        process.exit(1);
    }
}

// Export for use as module or run directly
if (require.main === module) {
    populateComprehensiveQuestions();
}

module.exports = { ComprehensiveQuestionPopulator, populateComprehensiveQuestions };