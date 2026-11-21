package com.familiar.glasses

/** All examples are fictional or generic. No biometric templates are stored. */
data class CueCard(val title: String, val body: String)

data class Preset(val id: String, val label: String, val cards: List<CueCard>)

object DemoCatalog {
    val presets = listOf(
        Preset("sunny", "Conversation: Sunny (FICTIONAL)", listOf(
            CueCard("SUNNY", "Met at Worn Hacks"),
            CueCard("A LITTLE CONTEXT", "Computer science graduate student"),
            CueCard("INTERESTS", "AI, smart glasses, building things"),
            CueCard("LAST TIME", "Discussed their hackathon project"),
            CueCard("NEXT TIME", "Ask how the demo went")
        )),
        Preset("networking", "Networking event", listOf(
            CueCard("START WITH CONTEXT", "What brought you to this event?"),
            CueCard("FIND COMMON GROUND", "What are you working on lately?"),
            CueCard("ASK A FOLLOW-UP", "What part has been most interesting?"),
            CueCard("CONNECT BY CHOICE", "Would you like to connect later?")
        )),
        Preset("dating", "Dating / first date", listOf(
            CueCard("START WITH CURIOSITY", "What was the highlight of your week?"),
            CueCard("ASK, THEN SHARE", "Share something of your own"),
            CueCard("RESPECT COMFORT", "Give space. Let the conversation breathe"),
            CueCard("BE PRESENT", "A perfect line is not necessary")
        )),
        Preset("meet", "Meeting someone new", listOf(
            CueCard("OPEN NATURALLY", "What brought you here?"),
            CueCard("FOLLOW THEIR LEAD", "Ask about something they mentioned"),
            CueCard("SHARE A LITTLE", "Offer a related detail about yourself")
        )),
        Preset("join", "Joining a group", listOf(
            CueCard("LISTEN FIRST", "Notice the topic before jumping in"),
            CueCard("FIND AN OPENING", "Mind if I join you?"),
            CueCard("BRING SOMEONE IN", "Ask another person what they think")
        )),
        Preset("continue", "Keep it going", listOf(
            CueCard("PICK UP A DETAIL", "Tell me a little more"),
            CueCard("BE CURIOUS", "What got you interested in that?"),
            CueCard("SHARE THE MOMENT", "Offer a short story of your own")
        )),
        Preset("reconnect", "Reconnect", listOf(
            CueCard("START WARM", "Good to see you again"),
            CueCard("REMEMBER A THREAD", "How did that project turn out?"),
            CueCard("CATCH UP", "What has changed since we last talked?")
        )),
        Preset("interview", "Job interview", listOf(
            CueCard("TAKE A BEAT", "A short pause is okay"),
            CueCard("BE SPECIFIC", "Describe what you did and the result"),
            CueCard("ASK A QUESTION", "What would success look like here?")
        )),
        Preset("exit", "Leaving politely", listOf(
            CueCard("WRAP UP", "Mention something you enjoyed"),
            CueCard("THANK THEM", "Great talking with you"),
            CueCard("EXIT KINDLY", "I'm going to say hello to others")
        ))
    )
    fun get(id: String): Preset? = presets.firstOrNull { it.id == id }
}
