/**
 * ANN Publisher v1.0 - Story Filler Module
 * Sprint 9 – Module 4
 * 
 * Purpose:
 *   Fills mapped InDesign frames with story content from edition.json.
 *   Populates headline, body, caption, and credit frames.
 *   Handles overset text and missing frames gracefully.
 *   Provides detailed statistics on fill operations.
 * 
 * Compatibility:
 *   - Adobe InDesign 2026
 *   - ExtendScript (ES3)
 *   - No modern JavaScript features
 *   - No JSON.parse, Object.keys, Array.isArray, forEach
 * 
 * Dependencies:
 *   - Module 1: 01_json_loader.jsx (for loadEdition())
 *   - Module 2: 02_frame_scanner.jsx (for scanFrames())
 *   - Module 3: 03_frame_mapper.jsx (for buildFrameMap(), MappedStories)
 * 
 * Core Operations:
 *   - Fills headline text from story.title
 *   - Fills body text from story.content
 *   - Fills caption text from story.excerpt
 *   - Fills credit text if available
 *   - Skips missing frames without interrupting
 *   - Logs all missing frames
 *   - Catches and records overset text errors
 *   - Returns comprehensive fill statistics
 * 
 * Usage:
 *   var mappedStories = buildFrameMap();
 *   var stats = fillStories(mappedStories);
 *   alert("Filled: " + stats.filledStories + " stories");
 */

/**
 * Retrieves text value from story property safely
 * Handles missing or null properties
 * 
 * @param {Object} story - Story object from mapped stories
 * @param {string} property - Property name to retrieve
 * @return {string} - Property value as string or empty string if not available
 */
function getStoryProperty(story, property) {
    if (!story || typeof story !== "object") {
        return "";
    }
    
    if (!story.hasOwnProperty(property)) {
        return "";
    }
    
    var value = story[property];
    
    if (value === null || value === undefined) {
        return "";
    }
    
    return String(value);
}

/**
 * Displays error alert dialog with formatted message
 * 
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @return {void}
 */
function showFillerError(title, message) {
    alert(title + "\n\n" + message);
}

/**
 * Validates that an object is not null and is of object type
 * 
 * @param {*} obj - Value to validate
 * @return {boolean} - True if obj is a non-null object
 */
function isValidObject(obj) {
    return obj !== null && typeof obj === "object";
}

/**
 * Validates that an array is not empty and has length property
 * 
 * @param {*} arr - Value to validate as array
 * @return {boolean} - True if arr is a non-empty array-like object
 */
function isValidArray(arr) {
    if (arr === null || arr === undefined) {
        return false;
    }
    
    if (typeof arr !== "object") {
        return false;
    }
    
    if (arr.length === undefined || arr.length <= 0) {
        return false;
    }
    
    return true;
}

/**
 * Validates that a frame object exists and is accessible
 * Checks for required frame properties
 * 
 * @param {Object} frame - Frame object to validate
 * @return {boolean} - True if frame is valid and accessible
 */
function isValidFrame(frame) {
    if (!isValidObject(frame)) {
        return false;
    }
    
    try {
        if (!frame.hasOwnProperty("contents")) {
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Attempts to set text content in a frame
 * Handles overset text and frame access errors
 * 
 * @param {Object} frame - Frame object to fill
 * @param {string} content - Text content to set
 * @param {string} frameName - Frame name for logging
 * @return {Object} - Result object with success status and any error message
 */
function fillFrameContent(frame, content, frameName) {
    var result = {
        success: false,
        hasOverset: false,
        error: null
    };
    
    // Validate frame exists
    if (!isValidFrame(frame)) {
        result.error = "Frame is not valid or not accessible";
        return result;
    }
    
    try {
        // Clear existing content
        frame.contents = "";
        
        // Set new content
        frame.contents = content;
        
        // Check for overset text
        try {
            if (frame.hasOwnProperty("overflowState")) {
                var overflowState = frame.overflowState;
                // OVERSET_STATE = 1405293424 (enum value)
                if (overflowState === 1405293424) {
                    result.hasOverset = true;
                }
            }
        } catch (e) {
            // Overset check failed, but content was set
        }
        
        result.success = true;
        return result;
    } catch (e) {
        result.error = "Failed to set content: " + e.message;
        return result;
    }
}

/**
 * Formats frame name for logging based on frame properties
 * Attempts to identify frame by label or type
 * 
 * @param {Object} frame - Frame object
 * @param {string} componentType - Component type (HEADLINE, BODY, etc.)
 * @return {string} - Formatted frame name for logging
 */
function formatFrameName(frame, componentType) {
    if (!isValidObject(frame)) {
        return componentType + "_unknown";
    }
    
    if (frame.hasOwnProperty("label") && frame.label) {
        return frame.label;
    }
    
    return componentType + "_frame";
}

/**
 * Creates a log entry for a missing frame
 * 
 * @param {number} storyIndex - Story index (0-indexed)
 * @param {string} componentType - Component type (HEADLINE, BODY, CAPTION, CREDIT)
 * @return {string} - Formatted log message
 */
function createMissingFrameLog(storyIndex, componentType) {
    return "Story " + storyIndex + ": Missing " + componentType + " frame";
}

/**
 * Creates a log entry for an overset text error
 * 
 * @param {number} storyIndex - Story index (0-indexed)
 * @param {string} componentType - Component type
 * @return {string} - Formatted log message
 */
function createOversetLog(storyIndex, componentType) {
    return "Story " + storyIndex + ": " + componentType + " frame has overset text";
}

/**
 * Fills all frames for a single mapped story
 * Processes headline, body, caption, and credit frames
 * 
 * Process:
 *   1. Extract story object from mapping
 *   2. For each frame type (headline, body, caption, credit):
 *      a. Check if frame exists in mapping
 *      b. If exists, extract content from story
 *      c. Attempt to fill frame
 *      d. Log any missing frames or overset errors
 *   3. Return operation statistics
 * 
 * @param {Object} mapping - Single story mapping from MappedStories
 * @param {number} storyIndex - Story index (0-indexed)
 * @param {array} missingFrameLog - Array to collect missing frame messages
 * @param {array} oversetLog - Array to collect overset error messages
 * @return {Object} - Fill statistics for this story
 */
function fillStoryMapping(mapping, storyIndex, missingFrameLog, oversetLog) {
    var stats = {
        filled: false,
        headlineSuccess: false,
        bodySuccess: false,
        captionSuccess: false,
        creditSuccess: false
    };
    
    if (!isValidObject(mapping)) {
        return stats;
    }
    
    var story = mapping.story;
    
    if (!isValidObject(story)) {
        return stats;
    }
    
    var headlineFrameFilled = false;
    var bodyFrameFilled = false;
    
    // Fill headline frame
    if (isValidFrame(mapping.headlineFrame)) {
        var headlineContent = getStoryProperty(story, "title");
        var headlineResult = fillFrameContent(mapping.headlineFrame, headlineContent, "HEADLINE");
        
        if (headlineResult.success) {
            stats.headlineSuccess = true;
            headlineFrameFilled = true;
        }
        
        if (headlineResult.hasOverset) {
            var headlineLog = createOversetLog(storyIndex, "HEADLINE");
            oversetLog.push(headlineLog);
        }
    } else {
        var headlineMissing = createMissingFrameLog(storyIndex, "HEADLINE");
        missingFrameLog.push(headlineMissing);
    }
    
    // Fill body frame
    if (isValidFrame(mapping.bodyFrame)) {
        var bodyContent = getStoryProperty(story, "content");
        var bodyResult = fillFrameContent(mapping.bodyFrame, bodyContent, "BODY");
        
        if (bodyResult.success) {
            stats.bodySuccess = true;
            bodyFrameFilled = true;
        }
        
        if (bodyResult.hasOverset) {
            var bodyLog = createOversetLog(storyIndex, "BODY");
            oversetLog.push(bodyLog);
        }
    } else {
        var bodyMissing = createMissingFrameLog(storyIndex, "BODY");
        missingFrameLog.push(bodyMissing);
    }
    
    // Fill caption frame (optional)
    if (isValidFrame(mapping.captionFrame)) {
        var captionContent = getStoryProperty(story, "excerpt");
        var captionResult = fillFrameContent(mapping.captionFrame, captionContent, "CAPTION");
        
        if (captionResult.success) {
            stats.captionSuccess = true;
        }
        
        if (captionResult.hasOverset) {
            var captionLog = createOversetLog(storyIndex, "CAPTION");
            oversetLog.push(captionLog);
        }
    }
    
    // Fill credit frame (optional)
    if (isValidFrame(mapping.creditFrame)) {
        var creditContent = getStoryProperty(story, "credit");
        var creditResult = fillFrameContent(mapping.creditFrame, creditContent, "CREDIT");
        
        if (creditResult.success) {
            stats.creditSuccess = true;
        }
        
        if (creditResult.hasOverset) {
            var creditLog = createOversetLog(storyIndex, "CREDIT");
            oversetLog.push(creditLog);
        }
    }
    
    // Story is considered filled if headline and body succeeded
    if (headlineFrameFilled && bodyFrameFilled) {
        stats.filled = true;
    }
    
    return stats;
}

/**
 * Fills all mapped story frames with content from edition.json
 * Main entry point for story filling operation
 * 
 * Process:
 *   1. Validates MappedStories array
 *   2. Initializes statistics and logging arrays
 *   3. Iterates through each mapped story
 *   4. For each story, fills all available frames
 *   5. Accumulates statistics across all stories
 *   6. Returns comprehensive fill statistics
 * 
 * Error handling:
 *   - Skips invalid story mappings without stopping
 *   - Skips missing frames without stopping
 *   - Catches overset text errors
 *   - Returns detailed error logs in statistics
 *   - Continues processing remaining stories on any error
 * 
 * Return statistics object:
 * {\n *     filledStories: number,      // Stories with headline and body filled
 *     totalStories: number,       // Total stories processed
 *     missingFrames: array,       // Log of all missing frames
 *     oversetErrors: array,       // Log of all overset errors
 *     headlinesFilled: number,    // Count of filled headline frames
 *     bodiesFilled: number,       // Count of filled body frames
 *     captionsFilled: number,     // Count of filled caption frames
 *     creditsFilled: number       // Count of filled credit frames
 * }
 * 
 * @param {array} mappedStories - MappedStories array from buildFrameMap()
 * @return {Object} - Fill statistics object
 */
function fillStories(mappedStories) {
    var stats = {
        filledStories: 0,
        totalStories: 0,
        missingFrames: [],
        oversetErrors: [],
        headlinesFilled: 0,
        bodiesFilled: 0,
        captionsFilled: 0,
        creditsFilled: 0
    };
    
    // Validate input
    if (!isValidArray(mappedStories)) {
        showFillerError("Fill Stories Failed", "Invalid or empty MappedStories array");
        return stats;
    }
    
    stats.totalStories = mappedStories.length;
    
    // Initialize logging arrays
    var missingFrameLog = [];
    var oversetLog = [];
    
    // Process each mapped story
    for (var i = 0; i < mappedStories.length; i++) {
        var mapping = mappedStories[i];
        
        // Fill this story's frames
        var storyStats = fillStoryMapping(mapping, i, missingFrameLog, oversetLog);
        
        // Accumulate statistics
        if (storyStats.filled) {
            stats.filledStories = stats.filledStories + 1;
        }
        
        if (storyStats.headlineSuccess) {
            stats.headlinesFilled = stats.headlinesFilled + 1;
        }
        
        if (storyStats.bodySuccess) {
            stats.bodiesFilled = stats.bodiesFilled + 1;
        }
        
        if (storyStats.captionSuccess) {
            stats.captionsFilled = stats.captionsFilled + 1;
        }
        
        if (storyStats.creditSuccess) {
            stats.creditsFilled = stats.creditsFilled + 1;
        }
    }
    
    // Assign logging arrays to statistics
    stats.missingFrames = missingFrameLog;
    stats.oversetErrors = oversetLog;
    
    return stats;
}

// ============================================================================
// Public API Export
// ============================================================================
// The following functions are available for external use:
// 
// fillStories(mappedStories)  - Main entry point, fills all story frames
// 
// Return value (fill statistics):
// {
//     filledStories: number,      // Stories with headline+body filled
//     totalStories: number,       // Total stories processed
//     missingFrames: array,       // Log of missing frame messages
//     oversetErrors: array,       // Log of overset text errors
//     headlinesFilled: number,    // Headline frames filled
//     bodiesFilled: number,       // Body frames filled
//     captionsFilled: number,     // Caption frames filled
//     creditsFilled: number       // Credit frames filled
// }
// 
// Required dependencies:
// - Module 1: loadEdition() and validateEdition() functions
// - Module 2: scanFrames() and findFrame() functions
// - Module 3: buildFrameMap() function and MappedStories array
// ============================================================================
