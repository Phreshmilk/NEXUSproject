const fetch = require('node-fetch');
const fs = require('fs').promises;

const API_URL = 'https://gelbooru.com/index.php?page=dapi&s=tag&q=index&json=1&limit=1000';
const OUTPUT_FILE = 'gelbooru_tags.json';
const CONCURRENT_REQUESTS = 5; // Number of concurrent requests

async function fetchTags(pid) {
    try {
        const response = await fetch(`${API_URL}&pid=${pid}`);
        const text = await response.text(); // Get the response as text first
        console.log(`API Response for pid ${pid}:`, text.slice(0, 200) + '...'); // Log a sample of the response
        
        if (text.trim() === '') {
            console.log(`Empty response for pid ${pid}. Assuming end of data.`);
            return null; // Signal end of data
        }
        
        const data = JSON.parse(text); // Now parse the text as JSON
        
        if (Array.isArray(data)) {
            return data.map(tag => tag.name);
        } else if (data && typeof data === 'object' && Array.isArray(data.tag)) {
            return data.tag.map(tag => tag.name);
        } else {
            console.error('Unexpected API response structure:', data);
            return [];
        }
    } catch (error) {
        console.error(`Error fetching tags for pid ${pid}:`, error.message);
        return null; // Signal an error occurred
    }
}

async function saveTags(tags) {
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(Array.from(tags), null, 2));
    console.log(`Saved ${tags.size} tags to ${OUTPUT_FILE}`);
}

async function main() {
    let allTags = new Set();
    let pid = 0;
    let newTagsFound = true;

    while (newTagsFound) {
        console.log(`Fetching pages ${pid} to ${pid + CONCURRENT_REQUESTS - 1}...`);
        const fetchPromises = [];
        for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
            fetchPromises.push(fetchTags(pid + i));
        }
        
        const tagArrays = await Promise.all(fetchPromises);
        
        const initialSize = allTags.size;
        let validResponses = 0;
        tagArrays.forEach(tags => {
            if (tags === null) {
                newTagsFound = false; // Stop if we get a null response (end of data or error)
            } else {
                tags.forEach(tag => allTags.add(tag));
                validResponses++;
            }
        });
        
        console.log(`Found ${allTags.size - initialSize} new tags. Total unique tags: ${allTags.size}`);
        
        if (validResponses > 0) {
            await saveTags(allTags);
            pid += CONCURRENT_REQUESTS;
        } else {
            newTagsFound = false; // Stop if we got no valid responses in this batch
        }
    }

    console.log('Finished fetching all unique tags.');
}

main().catch(console.error);