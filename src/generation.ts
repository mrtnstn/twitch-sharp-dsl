import { AstObject } from "./ast"
import {indefiniteArticleFor, withFirstUpper} from "./text-utils"


const generateForEntity = (entity: AstObject) => {
    const { singularName, pluralName, description } = entity.settings
    return `${withFirstUpper(indefiniteArticleFor(singularName))} ${singularName} (plural: ${pluralName}) describes ${description || "..."}.`
}


const generateForRelation = (relation: AstObject) => {
    const { leftHand, phrase, cardinality, rightHand } = relation.settings
    const rightHandDisplayName = rightHand && rightHand.ref?.settings[cardinality.endsWith("more") ? "pluralName" : "singularName"]
    return `Each ${leftHand && leftHand.ref?.settings["singularName"]} ${phrase} ${cardinality} ${rightHandDisplayName}.`
}

export const generateCode = (ast: AstObject) => {
    const { entities, relations } = ast.settings
    return `
Data Model


    Entities:

${entities.map((entity: AstObject) => `\t\t* ${generateForEntity(entity)}`).join("\n")}


    Relations:

${relations.map((relation: AstObject) => `\t\t* ${generateForRelation(relation)}`).join("\n")}

`
}

