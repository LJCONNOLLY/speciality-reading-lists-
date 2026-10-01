"""Builds src/data/study/queer-data.json from curated content + the PDFs' text.

Every quote below is checked against the extracted PDF text (bracketed
words are editorial restorations of scan-clipped text and are skipped
when checking). Use counts are computed, not typed. Run:

  python scripts/build_study.py <fulltext.json>

where fulltext.json maps book id -> list of page texts (see README).
"""
import json
import re
import sys
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOOKS = json.loads((ROOT / 'src/data/books/queer-critical-data-studies.json').read_text())
BOOK = {b['id']: b for b in BOOKS}
FULLTEXT = json.loads(Path(sys.argv[1]).read_text())

FORMS = {
    'sex': r'\bsex(?:es)?\b',
    'gender': r'\bgender(?:s|ed)?\b',
    'power': r'\bpowers?\b',
    'discourse': r'\bdiscours(?:e|es|ive)\b',
    'objectivity': r'\bobjectiv(?:ity|e)\b',
    'standpoint': r'\bstandpoints?\b',
    'category': r'\bcategor(?:y|ies)\b',
    'identity': r'\bidentit(?:y|ies)\b',
}

TERMS = [
    {
        'id': 'sex',
        'term': 'Sex',
        'summary': 'Moves from a fact of nature, to an object of truth-telling, to a hierarchy, to an effect of norms, and finally to a data field that can erase people.',
        'entries': {
            'foucault-history-of-sexuality-vol-1': (56, 'The essential point is that sex was not only a matter of sensation and pleasure, of law and taboo, but also of truth and falsehood, that the truth of sex became something fundamental, useful, or dangerous, precious or formidable: in short, that sex was constituted as a problem of truth.',
                'Sex is not a hidden natural fact but something modern institutions turned into an object of truth-telling: confession, medicine, science.', 'defines',
                'The starting point: sex stops being simply nature and becomes something produced by the demand to know it.'),
            'keller-gender-and-science': (12, 'Without getting into the empirical question of sex differences, about which there is a great deal of debate, it seems reasonable to suggest that we ought to expect that our early beliefs about gender will be subject to some degree of internalization.',
                'Keller sets sex differences aside as an open empirical question; her interest is the beliefs about gender that shape science.', 'in passing',
                'Sex is parked so gender can be examined as a belief system.'),
            'foucault-power-knowledge': (137, 'And I believe that the political significance of the problem of sex is due to the fact that sex is located at the point of intersection of the discipline of the body and the control of the population.',
                'Sex matters politically because it is where disciplining individual bodies meets managing whole populations.', 'defines',
                'Adds the governance angle: sex is the hinge between bodies and populations, which is exactly where counting and data enter later.'),
            'mackinnon-difference-and-dominance': (1, 'The philosophy underlying the difference approach is that sex is a difference, a division, a distinction, beneath which lies a stratum of human commonality, sameness.',
                'MacKinnon describes the legal view that sex is a neutral difference in order to reject it: sex is a question of power.', 'critiques',
                'Moves sex from difference to dominance.'),
            'butler-subjects-of-sex-gender-desire': (3, "If the immutable character of sex is contested, perhaps this construct called ‘sex’ is as culturally constructed as gender; indeed, perhaps it was always already gender, with the consequence that the distinction between sex and gender turns out to be no distinction at all.",
                'Sex may be as culturally constructed as gender, which collapses the sex/gender distinction earlier feminism relied on.', 'defines',
                'Breaks the sex/gender split: there is no pre-cultural sex underneath.'),
            'butler-gender-trouble': (177, 'On the other hand, Beauvoir was willing to affirm that one is born with a sex, as a sex, sexed, and that being sexed and being human are coextensive and simultaneous; sex is an analytic attribute of the human; there is no human who is not sexed; sex qualifies the human as a necessary attribute.',
                'Butler shows that even Beauvoir assumed everyone is born with a sex, and questions that assumption.', 'critiques',
                "Tests the new claim against feminism's own founders."),
            'longino-science-as-social-knowledge': (13, 'One chapter in this series (Chapter Six) focusses on the logical structure and evidential base of several research programs on sex differences.',
                'Sex-difference research is her test case for how background assumptions shape what counts as evidence.', 'in passing',
                'Sex becomes a case study in value-laden science.'),
            'crenshaw-mapping-the-margins': (13, 'Most crime statistics are classified by sex or race but none are classified by sex and race.',
                'Data systems record sex and race as separate fields, so women of color disappear from the numbers.', 'critiques',
                'The first text on this timeline to make sex a data problem: single-axis classification erases people.'),
            'butler-bodies-that-matter': (10, 'To claim that sex is already gendered, already constructed, is not yet to explain in which way the "materiality" of sex is forcibly produced.',
                "Saying sex is constructed isn't enough; one has to explain how norms produce the body's very materiality.", 'defines',
                "Shifts from 'sex is constructed' to how norms materialize bodies."),
        },
    },
    {
        'id': 'gender',
        'term': 'Gender',
        'summary': 'Starts as a developmental identity that shapes science, becomes a hierarchy, an interlocking axis with race, and then a performative effect of regulatory norms.',
        'entries': {
            'keller-gender-and-science': (12, 'Children of both sexes learn essentially the same set of ideas about the characteristics of male and female - how they then make use of these ideas in the development of their gender identity as male or female is another question.',
                'Gender is an identity formed in childhood development, and that development shapes how science imagines knowing.', 'defines',
                'Gender enters as psychology, and as something that leaks into science.'),
            'mackinnon-difference-and-dominance': (4, 'But if gender is an inequality first, constructed as a socially relevant differentiation in order to keep that inequality in place, then sex inequality questions are questions of systematic dominance, of male supremacy, which is not at all abstract and is anything but a mistake.',
                'Gender is inequality first; "difference" is the story told to keep that inequality in place.', 'defines',
                'Gender becomes a hierarchy, not a trait.'),
            'collins-learning-from-the-outsider-within': (6, 'Neither is seen as fully human, and therefore both become eligible for race/gender specific modes of domination.',
                'Gender never works alone; it interlocks with race in specific modes of domination.', 'in passing',
                'Gender as one axis in interlocking systems.'),
            'longino-science-as-social-knowledge': (13, 'In this chapter I compare the different roles gender ideologies play in structuring evidential relations.',
                'Gender ideology works as a background assumption inside scientific reasoning about evidence.', 'in passing',
                'Gender is located inside the logic of evidence itself.'),
            'butler-subjects-of-sex-gender-desire': (8, 'In this sense, gender is not a noun, but neither is it a set of free-floating attributes, for we have seen that the substantive effect of gender is performatively produced and compelled by the regulatory practices of gender coherence.',
                'Gender is neither a thing nor a free choice: it is performatively produced and compelled by regulatory practices.', 'defines',
                'Names the mechanism: regulation compels gender coherence.'),
            'butler-gender-trouble': (213, 'Because there is neither an “essence” that gender expresses or externalizes nor an objective ideal to which gender aspires, and because gender is not a fact, the various acts of gender create the idea of gender, and without those acts, there would be no gender at all.',
                'Gender is not a fact or an inner essence; repeated acts create the idea of gender.', 'defines',
                'Gender becomes performative.'),
            'crenshaw-mapping-the-margins': (5, 'In mapping the intersections of race and gender, the concept does engage [domi]nant assumptions that race and gender are essentially separate categories.',
                'Treating race and gender as separate categories hides the people at their intersection.', 'critiques',
                "Gender can't be analyzed on its own."),
            'harding-rethinking-standpoint-epistemology': (12, "Thus the claim by people who are women that women's lives provide a better starting point for thought about gender systems is not the same as the claim that their own lives are the best such starting points.",
                "Gender systems are best studied starting from women's lives, but that is a method, not a claim about who has authority.", 'in passing',
                'Gender systems as something best seen from below.'),
            'butler-bodies-that-matter': (9, 'If gender is constructed through relations of power and, specifically, normative constraints that not only produce but also regulate various bodily beings, how might agency be derived from this notion of gender as the effect of productive constraint?',
                'Gender is the effect of productive constraint; the open question is where agency comes from.', 'defines',
                "Answers critics of performativity: it isn't free choice but constrained repetition."),
        },
    },
    {
        'id': 'power',
        'term': 'Power',
        'summary': 'From repression to production: power makes subjects, differences, bodies, and the authority to define, which is what makes classification a question of power.',
        'entries': {
            'foucault-history-of-sexuality-vol-1': (93, 'Where there is power, there is resistance, and yet, or rather consequently, this resistance is never in a position of exteriority in relation to power.',
                'Power is a field of relations rather than a possession, and resistance arises inside it rather than outside.', 'defines',
                'Power becomes everywhere and productive, not only repressive.'),
            'keller-gender-and-science': (4, 'History reveals a most complex relation between the two, as complex perhaps as the interrelation between the dual constitutive motives for knowledge those of transcendence and power.',
                'Knowledge is driven partly by a wish for power, the domination of nature.', 'in passing',
                'Ties the will to know to the will to dominate.'),
            'foucault-power-knowledge': (131, 'In defining the effects of power as repression, one adopts a purely juridical conception of such power, one identifies power with a law which says no, power is taken above all as carrying the force of a prohibition.',
                'Treating power only as prohibition (a law that says no) misses how it produces knowledge and discourse.', 'critiques',
                "Spells out why 'power says no' is too thin."),
            'mackinnon-difference-and-dominance': (2, 'The difference approach misses the fact that hierarchy of power produces real as well as fantasied differences, differences that are also inequalities.',
                'Power produces sex differences, not the other way round.', 'defines',
                'Power comes before difference.'),
            'collins-learning-from-the-outsider-within': (5, 'The insistence on Black female self-definition reframes the entire dialogue from one of determining the technical accuracy of an image, to one stressing the power dynamics underlying the very process of definition itself.',
                'Power includes the power to define who someone is; accuracy is the wrong question.', 'defines',
                'The power to define becomes the issue, which is the core of later classification critique.'),
            'butler-gender-trouble': (39, 'Foucault points out that juridical systems of power produce the subjects they subsequently come to represent.',
                "Legal and political systems produce the subjects they claim only to represent, including feminism's 'women'.", 'defines',
                "Turns Foucault's productive power on the feminist subject itself."),
            'crenshaw-mapping-the-margins': (3, 'the view that the power in delineating difference need not be the power of dominatio[n; it can] instead be the source of social empowerment and reconstruction.',
                'Naming difference can empower the named, not only dominate them.', 'critiques',
                'The power to categorize can be reclaimed by the categorized.'),
            'butler-bodies-that-matter': (43, 'But power is that which forms, maintains, sustains, and regulates bodies at once, so that, strictly speaking, power is not a subject who acts on bodies as its distinct objects.',
                'Power is not an actor working on bodies; it forms and sustains them.', 'defines',
                'Power is located in the materialization of bodies.'),
        },
    },
    {
        'id': 'discourse',
        'term': 'Discourse',
        'summary': 'Begins as everyday talk, becomes the organized speech through which sex is governed, then something that constitutes subjects without fixing them for good.',
        'entries': {
            'foucault-history-of-sexuality-vol-1': (25, 'Not only were the boundaries of what one could say about sex enlarged, and men compelled to hear it said; but more important, discourse was connected to sex by a complex organization with varying effects, by a deployment that cannot be adequately explained merely by referring it to a law of prohibition.',
                'Talk about sex multiplied; discourse organizes sex rather than silencing it.', 'defines',
                'The starting point: talking about sex is how it is governed.'),
            'keller-gender-and-science': (1, 'Is it not odd that an association so familiar and so deeply entrenched is a topic only for informal discourse, literary allusion, and popular criticism?',
                'Used in the everyday sense of conversation.', 'in passing',
                "Still the ordinary sense: just 'talk'."),
            'foucault-power-knowledge': (82, 'Endeavouring on the other hand to decipher discourse through the use of spatial, strategic metaphors enables one to grasp precisely the points at which discourses are transformed in, through and on the basis of relations of power.',
                'Discourse is read strategically, at the points where power transforms it.', 'defines',
                "Ties discourse explicitly to power's strategies."),
            'mackinnon-difference-and-dominance': (1, 'My concern is not with which of these paths to sex equality is preferable in the long run or more appropriate to any particular issue, although most discourse on sex discrimination revolves about these questions as if that were all there is.',
                'Legal discourse frames sex equality so narrowly that other questions cannot be asked.', 'critiques',
                'Discourse as a frame that limits the options.'),
            'collins-learning-from-the-outsider-within': (3, 'As outsiders within, Black feminist scholars may be one of many distinct groups of marginal intellectuals whose standpoints promise to enrich contemporary sociological discourse.',
                "A discipline's discourse can be changed by those at its margins.", 'in passing',
                'Disciplinary discourse is open to marginal knowers.'),
            'butler-subjects-of-sex-gender-desire': (5, 'Whether gender or sex is fixed or free is a function of a discourse which, it will be suggested, seeks to set certain limits to analysis or to safeguard certain tenets of humanism as presuppositional to any analysis of gender.',
                'Even the debate over whether gender is fixed or free is set by a discourse with its own limits.', 'defines',
                'Discourse sets the terms of the debate itself.'),
            'crenshaw-mapping-the-margins': (4, 'Although the objective of this article is to describe the intersectional location of women of color and their marginalization within dominant resistance discourses, I do not mean to imply that the disempowerment of women of color is singularly or even primarily caused by feminist and antiracist theorists or activists.',
                'Even resistance discourses, feminist and antiracist, can marginalize women of color.', 'critiques',
                'The discourse of resisters can exclude too.'),
            'butler-bodies-that-matter': (194, 'In this sense, what is constituted in discourse is not fixed in or by discourse, but becomes the condition and occasion for a further action.',
                'Discourse constitutes subjects without fixing them; that leaves room for resignification.', 'defines',
                'Constituted, but not fixed.'),
        },
    },
    {
        'id': 'objectivity',
        'term': 'Objectivity',
        'summary': 'Goes from a masculine-coded ideal, to a set of procedures, to a social practice that is strongest when it starts from marginal lives.',
        'entries': {
            'keller-gender-and-science': (2, 'As Simmel observed, objectivity itself is an ideal which has a long history of identification with masculine.',
                'Objectivity has long been coded as masculine, which shapes who counts as a credible knower.', 'defines',
                'The starting point: objectivity has a gender.'),
            'longino-science-as-social-knowledge': (8, 'The objectivity of science, conceived as a set of rules and procedures for distinguishing true from false accounts of nature, is not undermined by arguments establishing modest forms of social constructionism.',
                'She lays out the defense that rules and procedures guarantee objectivity, and goes on to relocate objectivity in communities of critique.', 'critiques',
                'Objectivity moves from rules to social practice.'),
            'harding-rethinking-standpoint-epistemology': (7, 'In societies where scientific rationality and objectivity are claimed to be highly valued by dominant groups, marginalized peoples and those who listen attentively to them will point out that from the perspective of marginal lives, the dominant accounts are less than maximally objective.',
                "Dominant accounts are less objective than they claim; starting from marginal lives makes knowledge more objective ('strong objectivity').", 'defines',
                'Strong objectivity: start from below.'),
        },
    },
    {
        'id': 'standpoint',
        'term': 'Standpoint',
        'summary': "From an ordinary 'point of view' to a method: knowledge grounded in subordinated positions, defended against charges of circularity and identity politics.",
        'entries': {
            'foucault-history-of-sexuality-vol-1': (54, 'Their feeble content from the standpoint of elementary rationality, not to mention scientificity, earns them a place apart in the history of knowledge.',
                "Ordinary sense: 'judged from the point of view of'.", 'in passing',
                'Not yet a theory, just a point of view.'),
            'mackinnon-difference-and-dominance': (4, 'The dominance approach, in that it sees the inequalities of the social world from the standpoint of the subordination of women to men, is feminist.',
                "Seeing inequality from the position of women's subordination is what makes an approach feminist.", 'defines',
                'Standpoint becomes a feminist method.'),
            'collins-learning-from-the-outsider-within': (4, "Therefore, one role for Black female intellectuals is to produce facts and theories about the Black female experience that will clarify a Black woman's standpoint for Black women.",
                "Black women's standpoint is a site of knowledge that Black women intellectuals articulate.", 'defines',
                "Black women's standpoint as knowledge."),
            'longino-science-as-social-knowledge': (11, 'However, the theory one is attempting to vindicate by a standpoint methodology is required to identify this subclass, thus making the procedure circular.',
                'Standpoint methods risk circularity: the theory has to pick out whose perspective counts.', 'critiques',
                'A sharp critique of standpoint method.'),
            'harding-rethinking-standpoint-epistemology': (12, 'First, standpoint theorists themselves all explicitly argue that marginal lives that are not their own provide better grounds for certain kinds of knowledge.',
                "Standpoint isn't identity politics: it means starting from marginal lives, including lives that are not one's own.", 'defines',
                "Answers the critics: it's about where you start, not who you are."),
            'butler-bodies-that-matter': (142, 'black gay "natives" and not recognize that they are watching a work shaped and formed from a perspective and standpoint specific to Livingston.',
                "Ordinary critical sense: a film's view is shaped by its maker's position.", 'in passing',
                'Back to a perspective, applied to representation.'),
        },
    },
    {
        'id': 'category',
        'term': 'Category',
        'summary': 'Categories go from legal and institutional tools to political inventions that found what they name, which can be refused, contested, and reclaimed.',
        'entries': {
            'foucault-history-of-sexuality-vol-1': (45, 'As defined by the ancient civil or canonical codes, sodomy was a category of forbidden acts; their perpetrator was nothing more than the juridical subject of them.',
                'Sodomy was once a category of acts; the modern "homosexual" turns it into a category of person.', 'defines',
                'From acts to identities: the category makes the kind of person.'),
            'foucault-power-knowledge': (39, 'The court implies, therefore, that there are categories which are common to the parties present (penal categories such as theft, fraud; moral categories such as honesty and dishonesty) and that the parties to the dispute agree to submit to them.',
                'Institutions like courts depend on shared categories that people agree to submit to.', 'in passing',
                'Categories as institutional tools.'),
            'mackinnon-difference-and-dominance': (3, 'The goal of this dissident approach is not to make legal categories trace and trap the way things are.',
                'Legal categories should not just mirror, and so lock in, an unequal reality.', 'critiques',
                'Categories that trace reality also trap it.'),
            'collins-learning-from-the-outsider-within': (2, 'The 1970 census was the first time this category of work did not contain the largest segment of the Black female labor force.',
                'Census categories are used as evidence about Black women\'s labor.', 'in passing',
                'The census enters the story.'),
            'butler-subjects-of-sex-gender-desire': (1, 'The category of sex is the political category that founds society as heterosexual.',
                'Butler opens with this line from Monique Wittig: the category of sex is political and founds heterosexual society.', 'defines',
                'The category founds what it names.'),
            'butler-gender-trouble': (179, 'Through the lesbian refusal of those categories, the lesbian exposes (pronouns are a problem here) the contingent cultural constitution of those categories and the tacit yet abiding presumption of the heterosexual matrix.',
                "Refusing a category exposes that it is constructed, and the heterosexual matrix it presumes.", 'critiques',
                'Refusal reveals construction.'),
            'crenshaw-mapping-the-margins': (58, 'Clearly, there is unequal power, but there is nonetheless some d[egree of] agency that people can and do exert in the politics of naming.',
                "Categories can be contested from below: 'Black' and 'queer' were both remade by those they named.", 'defines',
                'The politics of naming.'),
            'butler-bodies-that-matter': (237, 'It is in this sense that the temporary totalization performed by identity categories is a necessary error.',
                'Identity categories are always incomplete, but politics still needs them: a necessary error.', 'defines',
                "Categories as a 'necessary error'."),
        },
    },
    {
        'id': 'identity',
        'term': 'Identity',
        'summary': 'From a status granted by others, to a self-coherence that norms compel, to a position on a map of power that can be erased or deployed.',
        'entries': {
            'foucault-history-of-sexuality-vol-1': (58, "The evolution of the word avowal and of the legal function it designated is itself emblematic of this development: from being a guarantee of the status, identity, and value granted to one person by another, it came to signify someone's acknowledgment of his own actions and thoughts.",
                'Identity once meant a status granted by others; confession turns it into something one admits about oneself.', 'in passing',
                'Identity moves inward through confession.'),
            'butler-subjects-of-sex-gender-desire': (6, "If ‘identity’ is an effect of discursive practices, to what extent is gender identity, construed as a relationship among sex, gender, sexual practice, and desire, the effect of a regulatory practice that can be identified as compulsory heterosexuality?",
                'Gender identity is the effect of a regulatory practice: compulsory heterosexuality.', 'defines',
                'Identity as an effect, not a source.'),
            'butler-gender-trouble': (57, 'What can be meant by “identity,” then, and what grounds the presumption that identities are self-identical, persisting through time as the same, unified and internally coherent?',
                'Butler questions the assumption that identities are unified and stable over time.', 'critiques',
                'Questions the coherence of identity itself.'),
            'crenshaw-mapping-the-margins': (3, 'this elision of difference in identity politics is problemati[c, funda]mentally because the violence that many women experience is ofte[n shaped] by other dimensions of their identities, such as race and class.',
                'Identity politics fails when it ignores differences within a group, such as race and class among women.', 'critiques',
                'Identity politics needs intersections.'),
            'harding-rethinking-standpoint-epistemology': (12, 'Second, and closely related, thinkers with "center" identities have also argued that marginalized lives are better places from which to start asking causal and critical questions about the social order.',
                "People with 'center' identities can also start thinking from marginal lives.", 'in passing',
                'Separates identity from standpoint.'),
            'butler-bodies-that-matter': (126, 'To ask such questions is still to continue to pose the question of "identity," but no longer as a preestablished position or a uniform entity; rather, as part of a dynamic map of power in which identities are constituted and/or erased, deployed and/or paralyzed.',
                'Identity is a position on a shifting map of power, where identities are made, erased, used, or frozen.', 'defines',
                'Identity on a map of power.'),
        },
    },
]

# Who cites whom, among the indexed texts. Counts are pages that name the author.
LINKS = [
    ('butler-gender-trouble', 'Foucault', 39, 'Foucault points out that juridical systems of power produce the subjects they subsequently come to represent.',
     "Foucault's productive power is the engine of the book: Butler turns it on feminism's own subject, 'women'."),
    ('butler-gender-trouble', 'MacKinnon', 13, 'Catharine MacKinnon offers a formulation of this problem that resonates with my own at the same time that there are, I believe, crucial and important differences between us.',
     "An argument, not an alliance: Butler says MacKinnon's account of gender hierarchy presumes heterosexuality."),
    ('butler-subjects-of-sex-gender-desire', 'Foucault', 6, 'The notion that there might be a ‘truth’ of sex, as Foucault ironically terms it, is produced precisely through the regulatory practices that generate coherent identities through the matrix of coherent gender norms.',
     "Foucault's 'truth of sex' becomes the regulatory gender norms of this chapter."),
    ('butler-bodies-that-matter', 'Foucault', 21, 'Thus, the question is no longer, How is gender constituted as and through a certain interpretation of sex? (a question that leaves the "matter" of sex untheorized), but rather Through what regulatory norms is sex itself materialized?',
     "Foucault's 'regulatory power' becomes the frame for asking how sex itself is materialized."),
    ('butler-bodies-that-matter', 'MacKinnon', 245, 'In theories such as Catharine MacKinnon\'s, sexual relations of subordination are understood to establish differential gender categories, such that "men" are those defined in a sexually dominating social position and "women" are those defined in subordination.',
     "MacKinnon's structuralism is the foil Butler wants queer theory and feminism to rethink together."),
    ('harding-rethinking-standpoint-epistemology', 'Collins', 12, 'Patricia Hill Collins, an African-American sociologist, has argued that starting thought from the lives of poor and in some cases illiterate African-American women reveals important truths about the lives of intellectuals',
     "Collins is one of Harding's central examples of a standpoint producing less partial knowledge."),
    ('harding-rethinking-standpoint-epistemology', 'Longino', 4, 'Recently, philosophers Helen Longino and Lynn Hankinson Nelson have developed sophisticated and valuable feminist empiricist philosophies of science',
     "Longino is Harding's main sparring partner: a feminist empiricist whose ideas overlap with standpoint theory."),
    ('harding-rethinking-standpoint-epistemology', 'Keller', 35, 'The term "objectivism" has been used to identify the objectionable notion by Bernstein, Keller, and Bordo, among others.',
     "Keller's critique of 'objectivism' is part of the ground Harding builds on."),
    ('longino-science-as-social-knowledge', 'Keller', 9, 'Scientist turned historian Evelyn Fox Keller has argued that the language of mainstream science is permeated by an ideology of domination created in the very processes of personal psychological development and individuation',
     'Longino summarizes Keller as one of the feminist critics whose challenge to scientific objectivity she takes up.'),
    ('collins-learning-from-the-outsider-within', 'Keller', 8, 'They note that there is an implicit belief in the duality of culture and nature.',
     "Collins cites Keller (1983) on the dualistic, gendered thinking that also structures racial and sexual oppression."),
    ('crenshaw-mapping-the-margins', 'MacKinnon', 5, 'citing Catharine MacKinnon, Feminism, Marxism, Method, and the State',
     'A footnote: Crenshaw borrows a point about naming groups from MacKinnon. A citation, not an argument.'),
]

AUTHOR_BOOKS = {
    'Foucault': ['foucault-history-of-sexuality-vol-1', 'foucault-power-knowledge'],
    'MacKinnon': ['mackinnon-difference-and-dominance'],
    'Collins': ['collins-learning-from-the-outsider-within'],
    'Longino': ['longino-science-as-social-knowledge'],
    'Keller': ['keller-gender-and-science'],
}
AUTHOR_RX = {'Foucault': r'\bFoucault', 'MacKinnon': r'\bMac ?Kinnon', 'Collins': r'\bCollins\b',
             'Longino': r'\bLongino', 'Keller': r'\bKeller\b'}

ESSAY = {
    'title': 'Talking to Each Other: How the Foundations Use Each Other',
    'paragraphs': [
        "Within the eleven foundational texts indexed so far, the conversation runs in two separate streams that barely touch. The first is the Foucault-to-Butler line on sex, power, and discourse. The second is the feminist epistemology line on objectivity and standpoint, running from Keller through Collins and Longino to Harding. Crenshaw and MacKinnon sit between them, cited by both streams but answering neither directly.",
        "Butler is the heaviest borrower by far. Foucault is named on dozens of pages of Gender Trouble and Bodies That Matter, and his idea that power produces the subjects it claims to describe is the engine of both books. MacKinnon gets the most pointed engagement: Butler credits her account of gender hierarchy as close to her own, then argues it quietly presumes heterosexuality. This is the move that opens room for queer theory to separate from, and argue with, structural feminism.",
        "Harding works as the hub of the epistemology stream. She takes Collins as a central example of thinking from marginal lives, treats Longino as a respected rival (a feminist empiricist whose ideas overlap with standpoint theory), and builds on Keller's critique of 'objectivism'. Longino, in turn, sets out Keller's argument that scientific language carries an ideology of domination. Collins cites Keller on the dualistic thinking that links gender, race, and sexual oppression.",
        "The missing link is the most telling one. None of the epistemologists cite Foucault, and Butler mentions Keller and Harding only in footnotes. Together the two streams make the claim this list rests on, that classification systems constitute what they claim to find. But in these texts the claim is assembled by the reader, not by the authors. The Classification and Datafication Critique readings are where the two streams finally meet: Bowker and Star, Spade, and Hoffmann pair Foucault's productive power with standpoint's attention to who does the counting.",
    ],
}

GALLERY = [
    # (id, term, definition, source bookId, termTimelineId or None)
    ('power-knowledge', 'Power/Knowledge', 'Power and knowledge are one formation: what can be known is shaped by power, and power works through what is known. This is why counting people is a question of governance, not only accuracy.', 'foucault-power-knowledge', 'power'),
    ('biopower', 'Biopower', "Modern power's focus on managing life: disciplining individual bodies and regulating whole populations through statistics, health, and sexuality.", 'foucault-history-of-sexuality-vol-1', 'sex'),
    ('repressive-hypothesis', 'The Repressive Hypothesis', 'The belief that modern society silenced sex. Foucault argues the opposite: discourse about sex multiplied, and that proliferation is how sex was governed.', 'foucault-history-of-sexuality-vol-1', 'discourse'),
    ('masculine-objectivity', 'Gendered Objectivity', 'The ideal of detached objectivity has a long history of being coded masculine, and that coding shapes who counts as a credible knower.', 'keller-gender-and-science', 'objectivity'),
    ('outsider-within', 'Outsider Within', 'The position of Black women inside institutions that do not fully include them. Collins argues it gives a distinctive angle of vision on those institutions.', 'collins-learning-from-the-outsider-within', 'standpoint'),
    ('dominance-approach', 'Dominance Approach', 'Sex inequality is a matter of hierarchy, not difference. Asking whether women are "the same as" or "different from" men already accepts a male standard.', 'mackinnon-difference-and-dominance', 'power'),
    ('performativity', 'Performativity', 'Gender is produced by repeated, norm-governed acts rather than expressing an inner essence. There is no gender behind the acts that create the idea of gender.', 'butler-gender-trouble', 'gender'),
    ('heterosexual-matrix', 'Heterosexual Matrix', 'The grid of cultural intelligibility that assumes sex, gender, and desire line up in a stable, binary, heterosexual way.', 'butler-gender-trouble', 'category'),
    ('contextual-empiricism', 'Contextual Empiricism', "Longino's account of objectivity as a social achievement: background assumptions shape evidence, so objectivity depends on communities that can criticize them.", 'longino-science-as-social-knowledge', 'objectivity'),
    ('intersectionality', 'Intersectionality', 'Race, gender, and other categories interact; analyzing them one at a time (or recording them in separate fields) erases people at their intersections.', 'crenshaw-mapping-the-margins', 'gender'),
    ('strong-objectivity', 'Strong Objectivity', "Knowledge becomes more objective, not less, when inquiry starts from the lives of marginalized people and examines its own social location.", 'harding-rethinking-standpoint-epistemology', 'objectivity'),
    ('materialization', 'Materialization', 'Bodies are not raw matter that culture then interprets; regulatory norms produce how sex comes to matter, in both senses.', 'butler-bodies-that-matter', 'sex'),
    ('orientation', 'Orientation', "Sexual orientation is literally about orientation: which objects and paths bodies are directed toward, and how queer bodies fall 'out of line'.", 'ahmed-queer-phenomenology', None),
    ('posttranssexual', 'Posttranssexual', 'A refusal to "pass" silently into a binary category. Stone asks trans people to write themselves into visibility instead.', 'stone-the-empire-strikes-back', None),
    ('residual-categories', 'Residual Categories', "The 'other' and 'not elsewhere classified' bins every classification system produces; what lands there shows what the system cannot see.", 'bowker-star-sorting-things-out', 'category'),
    ('administrative-violence', 'Administrative Violence', 'Harm done through ordinary bureaucratic sorting (IDs, records, benefits, prisons) rather than through explicit discrimination.', 'spade-normal-life', 'category'),
    ('raw-data', '"Raw Data"', 'A contradiction in terms: data are always already shaped by the choices and infrastructures that collect them.', 'gitelman-raw-data-is-an-oxymoron', None),
    ('biocertification', 'Biocertification', 'The fantasy that identity can be proven through the body, for example fingerprints, blood, or sex testing, and the systems built to certify it.', 'samuels-fantasies-of-identification', 'identity'),
    ('racializing-surveillance', 'Racializing Surveillance', 'Surveillance practices that produce and enforce racial categories; Browne roots biometric technologies in the surveillance of Blackness.', 'browne-s-dark-matters', None),
    ('automatic-gender-recognition', 'Automatic Gender Recognition', 'Software that infers gender from faces or bodies. Keyes shows it encodes a binary, physiological model of gender that misgenders trans people.', 'keyes-the-misgendering-machines', 'gender'),
    ('working-closets', 'Working Closets', 'How LGBTQ professionals selectively disclose or conceal identity in workplace communication.', 'cox-working-closets', 'identity'),
    ('tactical-technical-communication', 'Tactical Technical Communication', 'User-made instructions that route around institutions, such as trans people sharing DIY hormone protocols outside medical gatekeeping.', 'edenfield-holmes-colton-queering-tactical-technical-communication', None),
    ('discursive-violence', 'Discursive Violence', "Harm built into how data systems name and frame people, which 'inclusion' alone cannot fix.", 'hoffmann-terms-of-inclusion', 'discourse'),
    ('concept-capture', 'Concept Capture', 'When a contested concept, such as "gender identity" in state data, is co-opted or reshaped by the institutions that collect it.', 'collier-cowan-queer-conflicts-concept-capture', 'category'),
]


def norm(s):
    s = re.sub(r'-\n(\w)', r'\1', s)
    s = s.replace('­', '').replace('­', '')
    s = re.sub(r'[‘’]', "'", s)
    s = re.sub(r'[“”]', '"', s)
    return re.sub(r'\s+', ' ', s).strip()


def verify(book_id, page, quote):
    text = norm(FULLTEXT[book_id][page - 1])
    for frag in re.split(r'\[[^\]]*\]', quote):
        frag = norm(frag).strip(' .')
        if len(frag) < 6:
            continue
        if frag in text:
            continue
        # OCR / hyphenation tolerance: best fuzzy window
        n = len(frag)
        best = max((SequenceMatcher(None, frag, text[i:i + n]).ratio()
                    for i in range(0, max(1, len(text) - n), 3)), default=0)
        if best < 0.86:
            raise SystemExit(f'Quote not found: {book_id} p{page} ({best:.2f}): {frag[:80]}')


def uses(book_id, term_id):
    if book_id not in FULLTEXT:
        return None
    return sum(len(re.findall(FORMS[term_id], p, re.I)) for p in FULLTEXT[book_id])


INDEXED = [b['id'] for b in BOOKS if b['id'] in FULLTEXT]
by_year = sorted(INDEXED, key=lambda i: (BOOK[i]['year'], INDEXED.index(i)))

terms_out = []
for t in TERMS:
    entries = []
    for bid in by_year:
        e = {'bookId': bid, 'uses': uses(bid, t['id'])}
        if bid in t['entries']:
            page, quote, definition, stance, changed = t['entries'][bid]
            verify(bid, page, quote)
            e.update(page=page, quote=quote, definition=definition, stance=stance, changed=changed)
        entries.append(e)
    terms_out.append({'id': t['id'], 'term': t['term'], 'summary': t['summary'], 'books': entries})

links_out = []
for src, author, page, quote, how in LINKS:
    verify(src, page, quote)
    pages = sum(1 for p in FULLTEXT[src] if re.search(AUTHOR_RX[author], p))
    links_out.append({'from': src, 'author': author, 'toBooks': AUTHOR_BOOKS[author],
                      'pages': pages, 'page': page, 'quote': quote, 'how': how})

for g in GALLERY:
    assert g[3] in BOOK, g

out = {
    'indexed': INDEXED,
    'terms': terms_out,
    'talking': {'essay': ESSAY, 'links': links_out},
    'gallery': [dict(zip(['id', 'term', 'definition', 'bookId', 'termId'], g)) for g in GALLERY],
}
dest = ROOT / 'src/data/study/queer-data.json'
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(json.dumps(out, indent=1, ensure_ascii=False) + '\n')
print('wrote', dest, len(terms_out), 'terms', len(links_out), 'links', len(GALLERY), 'concepts')
