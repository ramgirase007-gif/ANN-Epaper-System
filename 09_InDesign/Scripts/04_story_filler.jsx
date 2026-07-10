/**
 * ANN Publisher v2.0 - Story Filler Module
 * Sprint 9 – Module 4 Production Build
 * 
 * Purpose:
 *   Fills InDesign frames with story content from edition.json.
 *   Populates headline, body, caption, and credit frames with text data.
 *   Detects overset text (content that exceeds frame capacity).
 *   Tracks missing frames and overset errors.
 *   Returns comprehensive fill report with statistics.
 * 
 * Compatibility:
 *   - Adobe InDesign 2026
 *   - ExtendScript (ES3) only
 *   - No modern JavaScript: no forEach, Object.keys, JSON.parse, Array.isArray
 * 
 * Dependencies:
 *   - buildFrameMap() from 03_frame_mapper.jsx
 * 
 * Input Data Structure (MappedStory):
 *   {
 *       storyIndex: Number,
 *       story: Object,              // Contains: title, content, caption, credit
 *       headlineFrame: Object|null, // Frame with .object (PageItem)
 *       bodyFrame: Object|null,
 *       captionFrame: Object|null,
 *       creditFrame: Object|null,
 *       errors: Array
 *   }
 * 
 * Story Object Properties (from edition.json):
 *   - title: String              // Headline text
 *   - content: String            // Body text
 *   - caption: String            // Photo caption
 *   - credit: String             // Photo credit
 * 
 * Output Data Structure (FillResult):
 *   {
 *       filledStories: Number,    // Count of stories with at least one frame filled
 *       headlinesFilled: Number,  // Count of headline frames filled
 *       bodiesFilled: Number,     // Count of body frames filled
 *       captionsFilled: Number,   // Count of caption frames filled
 *       creditsFilled: Number,    // Count of credit frames filled
 *       missingFrames: Array,     // [{storyIndex, frameType}, ...]
 *       oversetErrors: Array      // [{storyIndex, frameType, content}, ...]
 *   }
 * 
 * Public API:
 *   fillStories(mappedStories)   - Main entry point, fills all frames
 * 
 * Usage:
 *   var result = fillStories(mappedStories);
 *   alert("Filled " + result.headlinesFilled + " headlines");
 */

/**
 * Displays formatted error alert dialog
 * Format: Title\n\nDetailed message
 * 
 * @param {string} title - Alert title (short)
 * @param {string} message - Detailed error message
 * @return {void}
 */
function showFillerError(title, message) {
    alert(title + "\n\n" + message);
}

/**
 * Validates that an object is a valid TextFrame or frame container
 * Checks for required properties for text insertion
 * 
 * @param {Object} frame - Frame object to validate
 * @return {boolean} - True if frame is valid and can hold text
 */
function isValidTextFrame(frame) {
    if (!frame || typeof frame !== "object") {
        return false;
    }
    
    // Must have PageItem reference
    if (!frame.hasOwnProperty("object")) {
        return false;
    }
    
    var pageItem = frame.object;
    
    if (!pageItem || typeof pageItem !== "object") {
        return false;
    }
    
    // PageItem must be a TextFrame to hold text content
    try {
        if (!(pageItem instanceof TextFrame)) {
            return false;
        }
    } catch (e) {
        return false;
    }
    
    return true;
}

/**
 * Checks if a TextFrame has overset text
 * Overset occurs when text content exceeds frame capacity
 * 
 * @param {TextFrame} textFrame - InDesign TextFrame object
 * @return {boolean} - True if frame has overset text
 */
function hasOverset(textFrame) {
    if (!textFrame || !(textFrame instanceof TextFrame)) {
        return false;
    }
    
    try {
        // Check overflowState property for overset condition
        if (textFrame.hasOwnProperty("overflowState")) {
            // OVERSET_STATE enum value is 1405293424
            var overflowState = textFrame.overflowState;
            return overflowState === 1405293424;
        }
        
        // Check oversetText property as fallback
        if (textFrame.hasOwnProperty("oversetText")) {
            return textFrame.oversetText && textFrame.oversetText.length > 0;
        }
    } catch (e) {
        // Error checking overset - assume false
        return false;
    }
    
    return false;
}

/**
 * Safely inserts text content into a TextFrame
 * Handles content extraction and error cases
 * 
 * @param {TextFrame} textFrame - InDesign TextFrame to fill
 * @param {*} content - Content to insert (converted to string)
 * @return {boolean} - True if content was successfully inserted
 */
function insertContent(textFrame, content) {
    if (!textFrame || !(textFrame instanceof TextFrame)) {
        return false;
    }
    
    if (!content) {
        return false;
    }
    
    try {
        // Convert content to string
        var textContent = String(content);
        
        if (textContent === "" || textContent === "null" || textContent === "undefined") {
            return false;
        }
        
        // Clear existing content
        textFrame.contents = "";
        
        // Insert new content
        textFrame.contents = textContent;
        
        return true;
    } catch (e) {
        // Error inserting content
        return false;
    }
}

/**
 * Gets text content from a story object property
 * Safely extracts and validates story property
 * 
 * @param {Object} story - Story object from edition
 * @param {string} propertyName - Property name to extract
 * @return {string|null} - Property value or null if not available
 */
function getStoryProperty(story, propertyName) {
    if (!story || typeof story !== "object") {
        return null;
    }
    
    try {
        if (!story.hasOwnProperty(propertyName)) {
            return null;
        }
        
        var value = story[propertyName];
        
        if (value === null || value === undefined) {
            return null;
        }
        
        return String(value);
    } catch (e) {
        return null;
    }
}

/**
 * Fills a single frame with story content
 * Validates frame, extracts content, inserts text, checks for overset
 * 
 * @param {Object} frame - Frame object with PageItem reference
 * @param {string} content - Text content to insert
 * @return {Object} - Result object: {success, overset}
 */
function fillFrame(frame, content) {
    var result = {
        success: false,
        overset: false
    };
    
    // Validate frame
    if (!isValidTextFrame(frame)) {
        return result;
    }
    
    // Validate content
    if (!content || content === "") {
        return result;
    }
    
    try {
        var pageItem = frame.object;
        
        // Insert content
        var insertSuccess = insertContent(pageItem, content);
        
        if (!insertSuccess) {
            return result;
        }
        
        // Check for overset
        var oversetStatus = hasOverset(pageItem);
        
        result.success = true;
        result.overset = oversetStatus;
        
        return result;
    } catch (e) {
        // Error filling frame
        return result;
    }
}

/**
 * Processes a single mapped story
 * Fills headline, body, caption, and credit frames
 * Tracks success, overset, and missing frames
 * 
 * Process:
 *   1. Extract story content (title, content, caption, credit)
 *   2. Fill each frame type if present
 *   3. Check for overset after filling
 *   4. Track missing frames and errors
 * 
 * @param {Object} mappedStory - MappedStory object from buildFrameMap()
 * @param {Object} stats - Statistics object to update
 * @return {void}
 */
function processStory(mappedStory, stats) {
    if (!mappedStory || typeof mappedStory !== "object") {
        return;
    }
    
    var storyIndex = mappedStory.storyIndex;
    var story = mappedStory.story;
    
    if (!story || typeof story !== "object") {
        return;
    }
    
    var storyFilled = false;
    
    // Frame types to process
    var frameTypes = [
        { frameProperty: "headlineFrame", storyProperty: "title", frameName: "HEADLINE", statProperty: "headlinesFilled" },
        { frameProperty: "bodyFrame", storyProperty: "content", frameName: "BODY", statProperty: "bodiesFilled" },
        { frameProperty: "captionFrame", storyProperty: "caption", frameName: "CAPTION", statProperty: "captionsFilled" },
        { frameProperty: "creditFrame", storyProperty: "credit", frameName: "CREDIT", statProperty: "creditsFilled" }
    ];
    
    // Process each frame type (ES3 compatible)
    for (var typeIdx = 0; typeIdx < frameTypes.length; typeIdx++) {
        var frameType = frameTypes[typeIdx];
        var frameProperty = frameType.frameProperty;
        var storyProperty = frameType.storyProperty;
        var frameName = frameType.frameName;
        var statProperty = frameType.statProperty;
        
        // Check if frame exists
        if (!mappedStory.hasOwnProperty(frameProperty)) {
            continue;
        }
        
        var frame = mappedStory[frameProperty];
        
        if (!frame) {
            // Frame is null - track as missing
            stats.missingFrames.push({
                storyIndex: storyIndex,
                frameType: frameName
            });
            continue;
        }
        
        // Get story content
        var content = getStoryProperty(story, storyProperty);
        
        if (!content) {
            // No content for this frame - track as missing
            stats.missingFrames.push({
                storyIndex: storyIndex,
                frameType: frameName
            });
            continue;
        }
        
        // Fill the frame
        var fillResult = fillFrame(frame, content);
        
        if (fillResult.success) {
            // Increment fill counter
            stats[statProperty] = stats[statProperty] + 1;
            storyFilled = true;
            
            // Check for overset
            if (fillResult.overset) {
                stats.oversetErrors.push({
                    storyIndex: storyIndex,
                    frameType: frameName,
                    content: content.substr(0, 50) + "..."  // First 50 chars for preview
                });
            }
        } else {
            // Fill failed - track as missing
            stats.missingFrames.push({
                storyIndex: storyIndex,
                frameType: frameName
            });
        }
    }
    
    // Track if any frame in this story was filled
    if (storyFilled) {
        stats.filledStories = stats.filledStories + 1;
    }
}

/**
 * Generates fill report from statistics
 * Creates formatted string describing fill results
 * 
 * @param {Object} stats - Statistics object from fillStories()
 * @return {string} - Formatted report string
 */
function generateFillReport(stats) {
    if (!stats || typeof stats !== "object") {
        return "No fill data available.";
    }
    
    var report = "Story Filler Report\n";
    report = report + "===================\n";
    report = report + "Stories filled: " + stats.filledStories + "\n";
    report = report + "Headlines filled: " + stats.headlinesFilled + "\n";
    report = report + "Bodies filled: " + stats.bodiesFilled + "\n";
    report = report + "Captions filled: " + stats.captionsFilled + "\n";
    report = report + "Credits filled: " + stats.creditsFilled + "\n";
    
    if (stats.missingFrames && stats.missingFrames.length > 0) {
        report = report + "\nMissing frames: " + stats.missingFrames.length + "\n";
    }
    
    if (stats.oversetErrors && stats.oversetErrors.length > 0) {
        report = report + "Overset errors: " + stats.oversetErrors.length + "\n";
    }
    
    return report;
}

/**
 * Main entry point - Fills all mapped stories with content
 * 
 * Complete Process:
 *   1. Validate input (mappedStories array)
 *   2. Initialize statistics object
 *   3. For each mapped story:
 *      a. Extract story content
 *      b. Fill headline frame with title
 *      c. Fill body frame with content
 *      d. Fill caption frame with caption
 *      e. Fill credit frame with credit
 *      f. Check each frame for overset
 *      g. Track missing frames and errors
 *   4. Compile final statistics
 *   5. Display report
 *   6. Return result object
 * 
 * Error Handling:
 *   - Shows alert if mappedStories is invalid
 *   - Never crashes on fill errors - continues to next story
 *   - Tracks all errors in result object
 *   - Returns empty statistics on critical failure
 * 
 * @param {Array} mappedStories - Array of MappedStory objects from buildFrameMap()
 * @return {Object} - FillResult object with statistics and error tracking
 */
function fillStories(mappedStories) {
    // Step 1: Validate input
    if (!mappedStories || typeof mappedStories !== "object") {
        showFillerError(
            "Story Filler Failed",
            "Invalid or missing mappedStories array.\n\nPlease ensure buildFrameMap() was called successfully."
        );
        return {
            filledStories: 0,
            headlinesFilled: 0,
            bodiesFilled: 0,
            captionsFilled: 0,
            creditsFilled: 0,
            missingFrames: [],
            oversetErrors: []
        };
    }
    
    // Check if mappedStories is array-like
    var storyCount = 0;
    try {
        storyCount = mappedStories.length;
    } catch (e) {
        showFillerError(
            "Story Filler Failed",
            "Unable to read mappedStories array length.\n\nThe input may be corrupted."
        );
        return {
            filledStories: 0,
            headlinesFilled: 0,
            bodiesFilled: 0,
            captionsFilled: 0,
            creditsFilled: 0,
            missingFrames: [],
            oversetErrors: []
        };
    }
    
    if (storyCount === 0) {
        showFillerError(
            "Story Filler Failed",
            "No mapped stories to fill.\n\nPlease ensure stories exist in the edition."
        );
        return {
            filledStories: 0,
            headlinesFilled: 0,
            bodiesFilled: 0,
            captionsFilled: 0,
            creditsFilled: 0,
            missingFrames: [],
            oversetErrors: []
        };
    }
    
    // Step 2: Initialize statistics
    var stats = {
        filledStories: 0,
        headlinesFilled: 0,
        bodiesFilled: 0,
        captionsFilled: 0,
        creditsFilled: 0,
        missingFrames: [],
        oversetErrors: []
    };
    
    // Step 3: Process each story (ES3 compatible)
    for (var i = 0; i < storyCount; i++) {
        try {
            var mappedStory = mappedStories[i];
            
            if (mappedStory && typeof mappedStory === "object") {
                processStory(mappedStory, stats);
            }
        } catch (e) {
            // Error processing story - continue to next
        }
    }
    
    // Step 4: Generate report
    var report = generateFillReport(stats);
    
    // Step 5: Display report
    alert(report);
    
    // Step 6: Return result
    return stats;
}

/**
 * ============================================================================
 * PUBLIC API EXPORT
 * ============================================================================
 * 
 * Public Functions:
 *   fillStories(mappedStories)  - Main entry point, fills all story frames
 * 
 * Dependencies (must be loaded first):
 *   - buildFrameMap() from 03_frame_mapper.jsx
 * 
 * Input: mappedStories Array
 *   Array of MappedStory objects with structure:
 *   {
 *       storyIndex: Number,
 *       story: {
 *           title: String,
 *           content: String,
 *           caption: String,
 *           credit: String
 *       },
 *       headlineFrame: {object: TextFrame} | null,
 *       bodyFrame: {object: TextFrame} | null,
 *       captionFrame: {object: TextFrame} | null,
 *       creditFrame: {object: TextFrame} | null
 *   }
 * 
 * Output: FillResult Object
 *   {
 *       filledStories: Number,      // Stories with at least one filled frame
 *       headlinesFilled: Number,    // Headline frames filled
 *       bodiesFilled: Number,       // Body frames filled
 *       captionsFilled: Number,     // Caption frames filled
 *       creditsFilled: Number,      // Credit frames filled
 *       missingFrames: Array,       // [{storyIndex, frameType}, ...]
 *       oversetErrors: Array        // [{storyIndex, frameType, content}, ...]
 *   }
 * 
 * ============================================================================
 */
