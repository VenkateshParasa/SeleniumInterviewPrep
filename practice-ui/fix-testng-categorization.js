// Fix TestNG Categorization Script
// Adds TestNG questions from JSON file to TestNG category in database
// Created: December 22, 2025

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Simple database connection without the problematic models
const sqlite3 = require('sqlite3').verbose();

async function fixTestNGCategorization() {
    console.log('🔄 Starting TestNG categorization fix...');
    
    try {
        // Read TestNG questions from JSON file
        const questionsPath = path.join(__dirname, 'public/data/questions/testng-framework-questions.json');
        const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
        
        console.log(`📚 Found ${questionsData.totalQuestions} TestNG questions in JSON file`);
        
        // Connect to database directly
        const dbPath = path.join(__dirname, 'database/interview_prep.db');
        const db = new sqlite3.Database(dbPath);
        
        // Get TestNG category ID
        const testngCategory = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM categories WHERE slug = ?', ['testng'], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!testngCategory) {
            console.error('❌ TestNG category not found');
            return;
        }
        
        console.log(`✅ Found TestNG category with ID: ${testngCategory.id}`);
        
        let inserted = 0;
        let skipped = 0;
        
        // Process TestNG questions
        for (const category of questionsData.categories) {
            if (category.id === 'testng') {
                console.log(`📝 Processing ${category.questions.length} TestNG questions...`);
                
                for (const question of category.questions) {
                    try {
                        // Check if question already exists
                        const existing = await new Promise((resolve, reject) => {
                            db.get('SELECT id FROM questions WHERE question_text = ?', [question.question], (err, row) => {
                                if (err) reject(err);
                                else resolve(row);
                            });
                        });
                        
                        if (existing) {
                            // Update existing question to TestNG category
                            await new Promise((resolve, reject) => {
                                db.run('UPDATE questions SET category_id = ? WHERE id = ?', [testngCategory.id, existing.id], (err) => {
                                    if (err) reject(err);
                                    else resolve();
                                });
                            });
                            console.log(`🔄 Updated existing question: ${question.question.substring(0, 50)}...`);
                            inserted++;
                        } else {
                            // Insert new question
                            const questionData = {
                                uuid: uuidv4(),
                                category_id: testngCategory.id,
                                question_text: question.question,
                                answer: question.answer,
                                difficulty_level: question.difficulty === 'Easy' ? 2 : question.difficulty === 'Medium' ? 3 : 4,
                                question_type: 'theoretical',
                                tags: JSON.stringify(question.topic ? [question.topic.toLowerCase().replace(/\s+/g, '-')] : ['testng']),
                                estimated_time: 5,
                                source: 'TestNG Framework Questions',
                                is_active: 1
                            };
                            
                            await new Promise((resolve, reject) => {
                                db.run(`
                                    INSERT INTO questions (uuid, category_id, question_text, answer, difficulty_level, 
                                                         question_type, tags, estimated_time, source, is_active)
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                `, [
                                    questionData.uuid, questionData.category_id, questionData.question_text,
                                    questionData.answer, questionData.difficulty_level, questionData.question_type,
                                    questionData.tags, questionData.estimated_time, questionData.source, questionData.is_active
                                ], (err) => {
                                    if (err) reject(err);
                                    else resolve();
                                });
                            });
                            
                            console.log(`✅ Inserted new question: ${question.question.substring(0, 50)}...`);
                            inserted++;
                        }
                    } catch (error) {
                        console.error(`❌ Error processing question: ${error.message}`);
                        skipped++;
                    }
                }
            }
        }
        
        // Get final count
        const finalCount = await new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM questions WHERE category_id = ?', [testngCategory.id], (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });
        
        db.close();
        
        console.log('\n🎉 TestNG categorization fix completed!');
        console.log('=====================================');
        console.log(`✅ Processed: ${inserted} questions`);
        console.log(`⏭️  Skipped: ${skipped} questions`);
        console.log(`📊 Final TestNG category count: ${finalCount} questions`);
        console.log('=====================================');
        
    } catch (error) {
        console.error('❌ Fix failed:', error);
    }
}

// Run the fix
if (require.main === module) {
    fixTestNGCategorization();
}

module.exports = { fixTestNGCategorization };