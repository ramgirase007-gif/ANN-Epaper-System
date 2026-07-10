/**
 * ANN Publisher v1.0 - Frame Mapper Module
 * Sprint 9 – Module 3
 * 
 * Purpose:
 *   Connects edition.json stories with InDesign frames.
 *   Maps each story to its corresponding TextFrames and Graphics.
 *   Uses script labels to identify and match frames to story elements.
 *   Validates all mappings and provides query functions.
 * 
 * Compatibility:
 *   - Adobe InDesign 2026
 *   - ExtendScript (ES3)
 *   - No modern JavaScript features
 *   - No JSON.parse, Object.keys, Array.isArray
 * 
 * Dependencies:
 *   - Module 1: 01_json_loader.jsx (for loadEdition())
 *   - Module 2: 02_frame_scanner.jsx (for scanFrames())
 * 
 * Core Data Structure:
 *   MappedStories array contains objects with properties:
 *   - storyIndex (number) - Index of story (0-indexed)
 *   - page (number) - Page number where frames are located
 *   - headlineFrame (object) - Frame object or null
 *   - bodyFrame (object) - Frame object or null
 *   - photoFrame (object) - Frame object or null
 *   - captionFrame (object) - Frame object or null
 *   - creditFrame (object) - Frame object or null
 *   - story (object) - Original story data from edition.json
 * 
 * Label Convention:
 *   HEADLINE_<index>  (e.g., HEADLINE_1, HEADLINE_2)
 *   BODY_<index>      (e.g., BODY_1, BODY_2)
 *   PHOTO_<index>     (e.g., PHOTO_1, PHOTO_2)
 *   CAPTION_<index>   (e.g., CAPTION_1, CAPTION_2)
 *   CREDIT_<index>    (e.g., CREDIT_1, CREDIT_2)
 * 
 * Usage:
 *   var mappedStories = buildFrameMap();
 *   var validation = validateMapping(mappedStories);
 *   if (validation.valid) {
 *       var storyFrames = getStoryFrames(mappedStories, 0);
 *   }
 */

/**
 * Global MappedStories storage
 * Populated by buildFrameMap() function
 * Array of story mapping objects
 */
var MappedStories = [];

/**
 * Displays an error alert dialog with formatted message
 * 
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @return {void}
 */
function showMapperError(title, message) {
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
 * Validates edition.json structure
 * Checks for required properties and stories array
 * 
 * @param {*} edition - Edition object from JSON loader
 * @return {boolean} - True if edition is valid structure
 */
function isValidEdition(edition) {
    if (!isValidObject(edition)) {
        return false;
    }
    
    if (!edition.hasOwnProperty("stories")) {
        return false;
    }
    
    var stories = edition.stories;
    
    if (!isValidArray(stories)) {
        return false;
    }
    
    return true;
}

/**
 * Validates FrameMap structure from scanner module
 * Checks for array of frame objects with required properties
 * 
 * @param {*} frameMap - FrameMap array from frame scanner
 * @return {boolean} - True if frameMap is valid
 */
function isValidFrameMap(frameMap) {
    if (!isValidArray(frameMap)) {
        return false;
    }
    
    // Check first frame has required properties
    var firstFrame = frameMap[0];
    
    if (!isValidObject(firstFrame)) {
        return false;
    }
    
    if (!firstFrame.hasOwnProperty("label")) {
        return false;
    }
    
    if (!firstFrame.hasOwnProperty("page")) {
        return false;
    }
    
    return true;
}

/**
 * Converts 0-indexed story index to 1-indexed label suffix
 * Index 0 becomes "1", Index 1 becomes "2", etc.
 * 
 * @param {number} index - Story index (0-indexed)
 * @return {string} - Label suffix as string (1-indexed)
 */
function indexToLabelSuffix(index) {
    if (typeof index !== "number" || index < 0) {
        return "0";
    }
    
    var suffix = index + 1;
    return String(suffix);
}

/**
 * Builds frame label for a specific story component
 * Concatenates component type with label suffix
 * 
 * @param {string} componentType - Component type (HEADLINE, BODY, PHOTO, CAPTION, CREDIT)
 * @param {number} storyIndex - Story index (0-indexed)
 * @return {string} - Full label (e.g., "HEADLINE_1", "BODY_2")
 */
function buildComponentLabel(componentType, storyIndex) {
    var suffix = indexToLabelSuffix(storyIndex);
    return componentType + "_" + suffix;
}

/**
 * Searches FrameMap for frame with exact label match
 * Linear search through frameMap array
 * 
 * @param {array} frameMap - FrameMap array from scanner
 * @param {string} label - Label to search for
 * @return {Object|null} - Frame object with matching label, null if not found
 */
function findFrameByLabel(frameMap, label) {
    if (!isValidArray(frameMap)) {
        return null;
    }
    
    if (!label || label === "") {
        return null;
    }
    
    for (var i = 0; i < frameMap.length; i++) {
        var frame = frameMap[i];
        
        if (isValidObject(frame) && frame.hasOwnProperty("label")) {
            if (frame.label === label) {
                return frame;
            }
        }
    }
    
    return null;
}

/**
 * Extracts page number from frame object
 * Returns page property or 0 if not available
 * 
 * @param {Object|null} frame - Frame object from FrameMap
 * @return {number} - Page number or 0 if frame is null/invalid
 */
function getFramePage(frame) {
    if (!isValidObject(frame)) {
        return 0;
    }
    
    if (!frame.hasOwnProperty("page")) {
        return 0;
    }
    
    var page = frame.page;
    
    if (typeof page !== "number" || page < 0) {
        return 0;
    }
    
    return page;
}

/**
 * Determines primary page number from story frames
 * Returns page from first non-null frame found
 * Frames checked in order: headline, body, photo, caption, credit
 * 
 * @param {Object|null} headlineFrame - Headline frame or null
 * @param {Object|null} bodyFrame - Body frame or null
 * @param {Object|null} photoFrame - Photo frame or null
 * @param {Object|null} captionFrame - Caption frame or null
 * @param {Object|null} creditFrame - Credit frame or null
 * @return {number} - Page number or 0 if all frames null
 */
function determinePrimaryPage(headlineFrame, bodyFrame, photoFrame, captionFrame, creditFrame) {
    var frames = [headlineFrame, bodyFrame, photoFrame, captionFrame, creditFrame];
    
    for (var i = 0; i < frames.length; i++) {
        var frame = frames[i];
        var page = getFramePage(frame);
        
        if (page > 0) {
            return page;
        }
    }
    
    return 0;
}

/**
 * Creates a complete story mapping for a single story
 * Maps story to all required frames using standardized labels
 * 
 * Process:
 *   1. Build labels for each component (HEADLINE, BODY, PHOTO, CAPTION, CREDIT)
 *   2. Search frameMap for each label
 *   3. Create mapping object with frame references
 *   4. Determine primary page number
 *   5. Return complete mapping
 * 
 * @param {Object} story - Story object from edition.stories
 * @param {number} storyIndex - Story index (0-indexed)
 * @param {array} frameMap - FrameMap array from frame scanner
 * @return {Object} - Complete story mapping object
 */
function createStoryMapping(story, storyIndex, frameMap) {
    // Build labels for each component
    var headlineLabel = buildComponentLabel("HEADLINE", storyIndex);
    var bodyLabel = buildComponentLabel("BODY", storyIndex);
    var photoLabel = buildComponentLabel("PHOTO", storyIndex);
    var captionLabel = buildComponentLabel("CAPTION", storyIndex);
    var creditLabel = buildComponentLabel("CREDIT", storyIndex);
    
    // Search frameMap for matching frames
    var headlineFrame = findFrameByLabel(frameMap, headlineLabel);
    var bodyFrame = findFrameByLabel(frameMap, bodyLabel);
    var photoFrame = findFrameByLabel(frameMap, photoLabel);
    var captionFrame = findFrameByLabel(frameMap, captionLabel);
    var creditFrame = findFrameByLabel(frameMap, creditLabel);
    
    // Determine primary page from frames
    var page = determinePrimaryPage(headlineFrame, bodyFrame, photoFrame, captionFrame, creditFrame);
    
    // Create and return mapping object
    var mapping = {
        storyIndex: storyIndex,
        page: page,
        headlineFrame: headlineFrame,
        bodyFrame: bodyFrame,
        photoFrame: photoFrame,
        captionFrame: captionFrame,
        creditFrame: creditFrame,
        story: story
    };
    
    return mapping;
}

/**
 * Builds complete MappedStories array from edition and frameMap
 * Processes each story and creates frame mapping
 * 
 * Process:
 *   1. Calls loadEdition() to get edition data
 *   2. Calls scanFrames() to get frameMap
 *   3. Validates edition and frameMap structures
 *   4. Extracts stories array from edition
 *   5. Iterates through each story
 *   6. Creates mapping for each story
 *   7. Populates global MappedStories array
 *   8. Returns MappedStories array
 * 
 * Error handling:
 *   - Shows alert if loadEdition() fails
 *   - Shows alert if scanFrames() fails
 *   - Shows alert if edition structure invalid
 *   - Shows alert if frameMap structure invalid
 *   - Returns empty array on any error
 * 
 * @return {array} - MappedStories array with all story mappings
 */
function buildFrameMap() {
    // Step 1: Load edition data
    var edition = loadEdition();
    
    if (!isValidObject(edition)) {
        showMapperError("Build Frame Map Failed", "Unable to load edition.json");
        return [];
    }
    
    // Step 2: Scan InDesign frames
    var frameMap = scanFrames();
    
    if (!isValidArray(frameMap)) {
        showMapperError("Build Frame Map Failed", "Unable to scan InDesign frames");
        return [];
    }
    
    // Step 3: Validate edition structure
    if (!isValidEdition(edition)) {
        showMapperError("Build Frame Map Failed", "Edition structure is invalid");
        return [];
    }
    
    // Step 4: Validate frameMap structure
    if (!isValidFrameMap(frameMap)) {
        showMapperError("Build Frame Map Failed", "Frame map structure is invalid");
        return [];
    }
    
    // Step 5: Reset global MappedStories
    MappedStories = [];
    
    // Step 6: Extract stories array
    var stories = edition.stories;
    var storyCount = stories.length;
    
    // Step 7: Process each story
    for (var i = 0; i < storyCount; i++) {
        var story = stories[i];
        
        if (isValidObject(story)) {
            var mapping = createStoryMapping(story, i, frameMap);
            MappedStories.push(mapping);
        }
    }
    
    return MappedStories;
}

/**
 * Retrieves frame mapping for a specific story by index
 * Returns complete mapping including all frames and story data
 * 
 * @param {array} mappedStories - MappedStories array from buildFrameMap
 * @param {number} index - Story index (0-indexed)
 * @return {Object|null} - Mapped story object or null if not found
 */
function getStoryFrames(mappedStories, index) {
    if (!isValidArray(mappedStories)) {
        return null;
    }
    
    if (typeof index !== "number" || index < 0) {
        return null;
    }
    
    if (index >= mappedStories.length) {
        return null;
    }
    
    var mapping = mappedStories[index];
    
    if (!isValidObject(mapping)) {
        return null;
    }
    
    return mapping;
}

/**
 * Validates completeness of all frame mappings
 * Checks if each story has required frames mapped
 * 
 * Validation rules:
 *   - Headline frame MUST exist
 *   - Body frame MUST exist
 *   - If photo frame exists, caption MUST exist
 *   - If photo frame exists, credit MUST exist
 *   - Photo, caption, and credit are optional if not used
 * 
 * Returns validation result object with:
 *   - valid (boolean) - True if all stories pass validation
 *   - totalStories (number) - Total stories in mappedStories
 *   - completeStories (number) - Stories with all required frames
 *   - incompleteStories (number) - Stories missing required frames
 *   - messages (array) - Array of error messages for incomplete stories
 * 
 * @param {array} mappedStories - MappedStories array to validate
 * @return {Object} - Validation result object
 */
function validateMapping(mappedStories) {
    var result = {
        valid: true,
        totalStories: 0,
        completeStories: 0,
        incompleteStories: 0,
        messages: []
    };
    
    // Validate input
    if (!isValidArray(mappedStories)) {
        result.valid = false;
        result.messages.push("Invalid or empty MappedStories array.");
        return result;
    }
    
    result.totalStories = mappedStories.length;
    
    // Validate each story mapping
    for (var i = 0; i < mappedStories.length; i++) {
        var mapping = mappedStories[i];
        
        if (!isValidObject(mapping)) {
            result.incompleteStories = result.incompleteStories + 1;
            result.valid = false;
            result.messages.push("Story " + i + ": Invalid mapping object.");
            continue;
        }
        
        var isComplete = true;
        var errors = [];
        
        // Headline is required
        if (!isValidObject(mapping.headlineFrame)) {
            isComplete = false;
            errors.push("missing headline frame");
        }
        
        // Body is required
        if (!isValidObject(mapping.bodyFrame)) {
            isComplete = false;
            errors.push("missing body frame");
        }
        
        // Photo/caption/credit dependencies
        var hasPhoto = isValidObject(mapping.photoFrame);
        var hasCaption = isValidObject(mapping.captionFrame);
        var hasCredit = isValidObject(mapping.creditFrame);
        
        if (hasPhoto && !hasCaption) {
            isComplete = false;
            errors.push("photo exists but caption missing");
        }
        
        if (hasPhoto && !hasCredit) {
            isComplete = false;
            errors.push("photo exists but credit missing");
        }
        
        // Record results
        if (isComplete) {
            result.completeStories = result.completeStories + 1;
        } else {
            result.incompleteStories = result.incompleteStories + 1;
            result.valid = false;
            var errorMessage = "Story " + i + ": " + errors.join(", ");
            result.messages.push(errorMessage);
        }
    }
    
    return result;
}

// ============================================================================
// Public API Export
// ============================================================================
// The following functions are available for external use:
// 
// buildFrameMap()                  - Main entry point, creates all mappings
// getStoryFrames(mappedStories, i) - Retrieves single story mapping by index
// validateMapping(mappedStories)   - Validates all mappings completeness
// 
// Global data structure:
// MappedStories[]                  - Array of story mapping objects
// 
// Required dependencies:
// - Module 1: loadEdition() function must be available
// - Module 2: scanFrames() function must be available
// 
// Each MappedStories entry contains:
// {
//     storyIndex: number,           // 0-indexed story position
//     page: number,                 // Page where frames are located
//     headlineFrame: object|null,   // HEADLINE_<n> frame
//     bodyFrame: object|null,       // BODY_<n> frame
//     photoFrame: object|null,      // PHOTO_<n> frame (optional)
//     captionFrame: object|null,    // CAPTION_<n> frame (optional)
//     creditFrame: object|null,     // CREDIT_<n> frame (optional)
//     story: object                 // Original story from edition.json
// }
// ============================================================================
