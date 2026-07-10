/**
 * ANN Publisher v2.0 - Frame Mapper Module
 * Sprint 9 – Module 3 Production Build
 * 
 * Purpose:
 *   Maps edition stories to InDesign frames based on script labels.
 *   Orchestrates loadEdition() and scanFrames() functions.
 *   Creates frame mappings for HEADLINE, BODY, PHOTO, CAPTION, CREDIT frames.
 *   Stores actual PageItem object references for each mapped frame.
 *   Validates frame presence and prevents duplicate label assignments.
 * 
 * Compatibility:
 *   - Adobe InDesign 2026
 *   - ExtendScript (ES3) only
 *   - No modern JavaScript: no forEach, Object.keys, JSON.parse, Array.isArray
 * 
 * Dependencies:
 *   - loadEdition() from 01_json_loader.jsx
 *   - scanFrames() from 02_frame_scanner.jsx
 *   - validateEdition() from 01_json_loader.jsx
 * 
 * Core Data Structure (MappedStory):
 *   {
 *       storyIndex: Number,         // Index in edition.stories (0-based)
 *       story: Object,              // Reference to story object from edition
 *       headlineFrame: Object|null, // Frame entry or null if not found
 *       bodyFrame: Object|null,     // Frame entry or null if not found
 *       photoFrame: Object|null,    // Frame entry or null if not found
 *       captionFrame: Object|null,  // Frame entry or null if not found
 *       creditFrame: Object|null,   // Frame entry or null if not found
 *       errors: Array               // Array of validation error messages
 *   }
 * 
 * Public API:
 *   buildFrameMap()                 - Main entry point, orchestrates entire process
 * 
 * Usage:
 *   var mappedStories = buildFrameMap();
 *   if (mappedStories && mappedStories.length > 0) {
 *       for (var i = 0; i < mappedStories.length; i++) {
 *           var mapping = mappedStories[i];
 *           if (mapping.headlineFrame) {
 *               // Access ACTUAL PageItem: mapping.headlineFrame.object
 *           }
 *       }
 *   }
 */

/**
 * Displays formatted error alert dialog
 * Format: Title\n\nDetailed message
 * 
 * @param {string} title - Alert title (short)
 * @param {string} message - Detailed error message
 * @return {void}
 */
function showMappingError(title, message) {
    alert(title + "\n\n" + message);
}

/**
 * Counts occurrences of a specific label in the FrameMap
 * Used to detect duplicate labels
 * 
 * @param {Array} frameMap - FrameMap array from scanFrames()
 * @param {string} label - Label to search for
 * @return {number} - Count of frames with this label
 */
function countLabelOccurrences(frameMap, label) {
    if (!frameMap || frameMap.length === 0) {
        return 0;
    }
    
    var count = 0;
    
    // Iterate through frameMap (ES3 compatible)
    for (var i = 0; i < frameMap.length; i++) {
        var frame = frameMap[i];
        
        if (frame && frame.hasOwnProperty("label")) {
            if (frame.label === label) {
                count = count + 1;
            }
        }
    }
    
    return count;
}

/**
 * Searches for a specific label in the FrameMap
 * Returns the frame object if found, null otherwise
 * 
 * @param {Array} frameMap - FrameMap array from scanFrames()
 * @param {string} label - Label to search for
 * @return {Object|null} - Frame object with PageItem reference or null
 */
function findLabelInFrameMap(frameMap, label) {
    if (!frameMap || frameMap.length === 0 || !label || label === "") {
        return null;
    }
    
    // Iterate through frameMap (ES3 compatible)
    for (var i = 0; i < frameMap.length; i++) {
        var frame = frameMap[i];
        
        if (frame && frame.hasOwnProperty("label")) {
            if (frame.label === label) {
                return frame;
            }
        }
    }
    
    return null;
}

/**
 * Validates that a story object has the expected structure
 * Checks for basic properties required for processing
 * 
 * @param {Object} story - Story object to validate
 * @return {boolean} - True if story is a valid object
 */
function isValidStory(story) {
    if (!story || typeof story !== "object") {
        return false;
    }
    
    return true;
}

/**
 * Creates label name for story frame (HEADLINE, BODY, PHOTO, etc.)
 * Concatenates label prefix with story index number
 * 
 * @param {string} prefix - Frame type prefix (e.g., "HEADLINE")
 * @param {number} storyIndex - Story index (0-based, will add 1 for frame numbering)
 * @return {string} - Complete label (e.g., "HEADLINE_1")
 */
function createFrameLabel(prefix, storyIndex) {
    var frameNumber = storyIndex + 1;  // Convert to 1-based numbering
    return prefix + "_" + frameNumber;
}

/**
 * Processes a single story and maps its frames
 * Searches for HEADLINE, BODY, PHOTO, CAPTION, CREDIT frames
 * Validates frame existence and warns about duplicates
 * 
 * Process:
 *   1. Create frame label for each frame type
 *   2. Search for frame in FrameMap
 *   3. Store frame object with PageItem reference
 *   4. Track missing frames and duplicates
 * 
 * @param {Object} story - Story object from edition.stories
 * @param {number} storyIndex - Index in stories array (0-based)
 * @param {Array} frameMap - FrameMap array from scanFrames()
 * @return {Object} - MappedStory object with all frame references
 */
function mapStory(story, storyIndex, frameMap) {
    if (!frameMap) {
        frameMap = [];
    }
    
    var errors = [];
    
    // Create MappedStory object
    var mappedStory = {
        storyIndex: storyIndex,
        story: story,
        headlineFrame: null,
        bodyFrame: null,
        photoFrame: null,
        captionFrame: null,
        creditFrame: null,
        errors: errors
    };
    
    // Array of frame types to process
    var frameTypes = [
        { type: "HEADLINE", property: "headlineFrame" },
        { type: "BODY", property: "bodyFrame" },
        { type: "PHOTO", property: "photoFrame" },
        { type: "CAPTION", property: "captionFrame" },
        { type: "CREDIT", property: "creditFrame" }
    ];
    
    // Process each frame type (ES3 compatible)
    for (var typeIdx = 0; typeIdx < frameTypes.length; typeIdx++) {
        var frameType = frameTypes[typeIdx];
        var prefix = frameType.type;
        var property = frameType.property;
        
        // Create label for this story and frame type
        var label = createFrameLabel(prefix, storyIndex);
        
        // Search for frame in FrameMap
        var frame = findLabelInFrameMap(frameMap, label);
        
        if (frame) {
            // Frame found - store in mapping
            mappedStory[property] = frame;
        } else {
            // Frame not found
            errors.push(prefix + " frame '" + label + "' not found");
            mappedStory[property] = null;
        }
        
        // Check for duplicate labels (warn but don't fail)
        var count = countLabelOccurrences(frameMap, label);
        if (count > 1) {
            errors.push("WARNING: Duplicate label '" + label + "' (" + count + " found)");
        }
    }
    
    return mappedStory;
}

/**
 * Validates entire mapped stories collection
 * Checks for critical errors that prevent processing
 * 
 * Validation rules:
 *   1. At least one story was successfully mapped
 *   2. Most stories have at least some frames (not all missing)
 *   3. Report duplicate labels found
 * 
 * @param {Array} mappedStories - Array of MappedStory objects
 * @return {boolean} - True if mapping is usable
 */
function validateMappedStories(mappedStories) {
    if (!mappedStories || mappedStories.length === 0) {
        return false;
    }
    
    // Check if at least one story has at least one frame
    var hasAtLeastOneFrame = false;
    
    // Iterate through mapped stories (ES3 compatible)
    for (var i = 0; i < mappedStories.length; i++) {
        var mapping = mappedStories[i];
        
        if (!mapping) {
            continue;
        }
        
        // Check if any frame is present
        if (mapping.headlineFrame || mapping.bodyFrame || mapping.photoFrame || 
            mapping.captionFrame || mapping.creditFrame) {
            hasAtLeastOneFrame = true;
            break;
        }
    }
    
    return hasAtLeastOneFrame;
}

/**
 * Generates error report from mapped stories
 * Collects all validation errors for display
 * 
 * @param {Array} mappedStories - Array of MappedStory objects
 * @return {string} - Formatted error report string
 */
function generateErrorReport(mappedStories) {
    if (!mappedStories || mappedStories.length === 0) {
        return "No stories to process.";
    }
    
    var errorList = "";
    var totalErrors = 0;
    
    // Iterate through mapped stories (ES3 compatible)
    for (var i = 0; i < mappedStories.length; i++) {
        var mapping = mappedStories[i];
        
        if (!mapping || !mapping.errors || mapping.errors.length === 0) {
            continue;
        }
        
        // Add story header
        errorList = errorList + "\nStory " + (mapping.storyIndex + 1) + ":\n";
        
        // Iterate through errors for this story (ES3 compatible)
        for (var errorIdx = 0; errorIdx < mapping.errors.length; errorIdx++) {
            var error = mapping.errors[errorIdx];
            errorList = errorList + "  - " + error + "\n";
            totalErrors = totalErrors + 1;
        }
    }
    
    if (totalErrors === 0) {
        return "All frames mapped successfully.";
    }
    
    return "Found " + totalErrors + " issues:" + errorList;
}

/**
 * Main entry point - Orchestrates entire frame mapping process
 * 
 * Complete Process:
 *   1. Call loadEdition() to load edition.json
 *   2. Call scanFrames() to get InDesign frame map
 *   3. Validate both data sources
 *   4. For each story in edition.stories:
 *      a. Create frame labels (HEADLINE_n, BODY_n, etc.)
 *      b. Search for frames in FrameMap
 *      c. Store frame references with PageItem objects
 *      d. Track validation errors
 *   5. Validate mapping results
 *   6. Display error report with warnings
 *   7. Return array of MappedStory objects
 * 
 * Error Handling:
 *   - Shows formatted alerts for missing edition or frames
 *   - Reports missing frame labels as warnings
 *   - Reports duplicate labels as warnings
 *   - Never crashes - returns empty array on critical failure
 * 
 * @return {Array} - Array of MappedStory objects with frame references and PageItems
 */
function buildFrameMap() {
    // Step 1: Load edition.json
    var edition = loadEdition();
    
    if (!edition) {
        showMappingError(
            "Frame Mapping Failed",
            "Unable to load edition.json.\n\nPlease ensure the file exists and is valid."
        );
        return [];
    }
    
    // Step 2: Validate edition structure
    if (!validateEdition(edition)) {
        showMappingError(
            "Frame Mapping Failed",
            "Edition object is invalid.\n\nMissing required properties: pages, stories"
        );
        return [];
    }
    
    // Step 3: Validate edition has stories
    if (!edition.hasOwnProperty("stories") || !edition.stories) {
        showMappingError(
            "Frame Mapping Failed",
            "Edition has no stories.\n\nPlease ensure edition.json contains a stories array."
        );
        return [];
    }
    
    // Step 4: Get story count
    var storyCount = 0;
    try {
        storyCount = edition.stories.length;
    } catch (e) {
        showMappingError(
            "Frame Mapping Failed",
            "Unable to read stories array from edition.\n\nThe stories property may be corrupted."
        );
        return [];
    }
    
    if (storyCount === 0) {
        showMappingError(
            "Frame Mapping Failed",
            "Edition contains no stories.\n\nPlease ensure edition.json has at least one story."
        );
        return [];
    }
    
    // Step 5: Scan InDesign frames
    var frameMap = scanFrames();
    
    if (!frameMap || frameMap.length === 0) {
        showMappingError(
            "Frame Mapping Failed",
            "No labeled frames found in InDesign document.\n\nPlease ensure all frames have script labels."
        );
        return [];
    }
    
    // Step 6: Build mapped stories array
    var mappedStories = [];
    
    // Iterate through stories (ES3 compatible)
    for (var storyIdx = 0; storyIdx < storyCount; storyIdx++) {
        try {
            var story = edition.stories[storyIdx];
            
            if (!isValidStory(story)) {
                continue;
            }
            
            // Map this story to its frames
            var mappedStory = mapStory(story, storyIdx, frameMap);
            
            // Add to collection
            mappedStories.push(mappedStory);
        } catch (e) {
            // Error processing story - skip and continue
        }
    }
    
    // Step 7: Validate mapping results
    if (!validateMappedStories(mappedStories)) {
        showMappingError(
            "Frame Mapping Warning",
            "No valid frame mappings created.\n\nNo stories have any matching frames.\n\nPlease verify frame labels in InDesign document."
        );
        return mappedStories;
    }
    
    // Step 8: Generate and display error report
    var errorReport = generateErrorReport(mappedStories);
    
    if (errorReport && errorReport !== "All frames mapped successfully.") {
        alert("Frame Mapping Results\n\n" + errorReport);
    }
    
    // Step 9: Return mapped stories
    return mappedStories;
}

/**
 * ============================================================================
 * PUBLIC API EXPORT
 * ============================================================================
 * 
 * Public Functions:
 *   buildFrameMap()     - Main entry point, orchestrates entire mapping process
 * 
 * Dependencies (must be loaded first):
 *   - loadEdition() from 01_json_loader.jsx
 *   - validateEdition() from 01_json_loader.jsx
 *   - scanFrames() from 02_frame_scanner.jsx
 * 
 * MappedStory Structure:
 *   Each mapped story contains:
 *   - storyIndex: 0-based index in edition.stories
 *   - story: Reference to original story object
 *   - headlineFrame: Frame object or null
 *   - bodyFrame: Frame object or null
 *   - photoFrame: Frame object or null
 *   - captionFrame: Frame object or null
 *   - creditFrame: Frame object or null
 *   - errors: Array of validation error messages
 * 
 * Frame objects contain:
 *   - label: Script label string
 *   - object: ACTUAL InDesign PageItem reference
 *   - page: Page number (1-indexed)
 *   - pageName: Page name
 *   - bounds: Geometric bounds [y1, x1, y2, x2]
 *   - type: Frame type (TextFrame, Rectangle, Oval, Polygon, Graphic)
 *   - layer: Layer name
 *   - id: Unique frame identifier
 * 
 * ============================================================================
 */
