/*
 * Everything that's specific to our particular shape of AST goes in this file.
 */

import { Entity } from "./concepts"
import { Associative, Characteristic, Kernel, Reference } from "./entity-kinds"

/*
 * Let's first define some types to describe AST elements
 */
export interface AstBaseObject {
    concept: string
    settings: {[name: string]: any}
}

export interface AstObject extends AstBaseObject {
    id: string
}

export interface AstReference {
    ref: AstObject | null
}

export type AstElement = AstObject | AstReference | AstElement[]


export const entityKind = (entity: AstObject, dataModel: AstObject) => {
    const incomingRelations = dataModel.settings["relations"].filter((relation: AstObject) => relation.settings["rightHand"]?.ref === entity)
    const incomingCrowsFeet = incomingRelations.some((relation: AstObject) => relation.settings["cardinality"].endsWith("more"))
    if (incomingCrowsFeet > 1) {
        return Associative
    }
    if (incomingCrowsFeet === 1) {
        return Characteristic
    }
    return entity.settings["isReference"] ? Reference : Kernel
}


export const dataModel = (ancestors: AstObject[]) => ancestors[ancestors.length - 1]

export interface Issue {
    propertyName: string
    message: string
}

export function validate(value: AstObject, ancestors: AstObject[]): Issue[] {
    const issues: Issue[] = []
    const { settings } = value
    switch (value.concept) {
        case Entity: {
            if (dataModel(ancestors).settings["entities"].some((otherEntity: AstObject) => otherEntity !== value && otherEntity.settings["singularName"] === settings["singularName"])) {
                issues.push({ propertyName: "singularName", message: "Another with the same singular name already exists." })
            }
            if (dataModel(ancestors).settings["entities"].some((otherEntity: AstObject) => otherEntity !== value && otherEntity.settings["pluralName"] === settings["pluralName"])) {
                issues.push({ propertyName: "pluralName", message: "Another with the same plural name already exists." })
            }
        }
    }
    return issues
}


export const issuesForProperty = (issues: Issue[], propertyName: string) => (issues && issues.filter((issue) => issue.propertyName === propertyName)) || []

