import { AstBaseObject, AstElement, AstObject, AstReference } from "./ast"

const isObject = (value: any) => (!!value) && (typeof value === "object") && !Array.isArray(value)

export function isAstObject(value: any): value is AstObject {
    return isObject(value) && ("concept" in value) && ("settings" in value)
}

export function isAstReference(value: any): value is AstReference {
    return isObject(value) && ("ref" in value)
}


// re-export shortid.generate under a nicer name
import { generate as newId } from "shortid"
export { newId }

export function withComputedIds(value: AstBaseObject): AstObject {
    const ast: AstObject = {
        id: newId(),
        concept: value.concept,
        settings: {},
    }
    for (const propertyName in value.settings) {
        const settingValue = value.settings[propertyName]
        if (Array.isArray(settingValue)) {
            ast.settings[propertyName] = settingValue.map(withComputedIds)
        } else {
            ast.settings[propertyName] = withComputedIds(settingValue)
        }
    }
    return ast
}


import { observable } from "mobx"

export function asObservable(ast: AstElement) {
    const id2ObservableAstObject: { [id: string]: AstObject } = {}
    const refObjectsToFix: [string, AstReference][] = []

    function asObservableInternal(value: AstElement) {
        if (isAstObject(value)) {
            const observableAstObject: AstObject = observable.object({
                id: value.id,
                concept: value.concept,
                settings: {}
            })
            for (const propertyName in value.settings) {
                observableAstObject.settings[propertyName] = asObservableInternal(value.settings[propertyName])
            }
            id2ObservableAstObject[value.id] = observableAstObject
            return observableAstObject
        }
        if (isAstReference(value)) {
            const refObjectToFix: AstReference = observable.object({ ref: null})
            refObjectsToFix.push([ value.ref?.id || "", refObjectToFix ])
            return refObjectToFix
        }
        if (Array.isArray(value)) {
            return value.map(asObservableInternal)
        }
        return value
    }

    const observableAst = asObservableInternal(ast)

    refObjectsToFix.forEach(([ refId, refObjectToFix ]) => {
        refObjectToFix.ref = id2ObservableAstObject[refId]
    })

    return observableAst
}


export const newAstObject: (concept: string) => AstObject = (concept) => observable.object({
    id: newId(),
    concept: concept,
    settings: {}
})


export function serialize(value: AstElement | undefined) {
    if (isAstObject(value)) {
        const serializedAstObject = {
            id: value.id,
            concept: value.concept,
            settings: {}
        }
        for (const propertyName in value.settings) {
            serializedAstObject.settings[propertyName] = serialize(value.settings[propertyName])
        }
        return serializedAstObject
    }
    if (isAstReference(value)) {
        // Instead of a reference object, return an object with a 'refId === ref.id':
        return ({
            refId: value.ref?.id
        })
    }
    if (Array.isArray(value)) {
        return value.map(serialize)
    }
    return value
}


const isSerializedAstReference = (value: any) => isObject(value) && ("refId" in value)

export function deserialize(serializedAst: any) {
    const id2AstObject: {[id: string]: AstObject} = {}
    const referencesToResolve: [string, AstReference][] = []

    function deserializeInternal(value: any) {
        if (isAstObject(value)) {
            const astObject: AstObject = {
                id: value.id,
                concept: value.concept,
                settings: {}
            }
            for (const propertyName in value.settings) {
                astObject.settings[propertyName] = deserializeInternal(value.settings[propertyName])
            }
            id2AstObject[value.id] = astObject
            return astObject
        }
        if (isSerializedAstReference(value)) {
            const refObjectToFix: AstReference = { ref: null }
            referencesToResolve.push([ value.refId, refObjectToFix ])
            return refObjectToFix
        }
        if (Array.isArray(value)) {
            return value.map(deserializeInternal)
        }
        return value
    }

    const deserializedAst = deserializeInternal(serializedAst)

    referencesToResolve.forEach(([ refId, refObjectToFix ]) => {
        refObjectToFix.ref = id2AstObject[refId]
    })

    return deserializedAst
}


export function deserializeObservably(serializedAst: any) {
    const id2ObservableAstObject: {[id: string]: AstObject} = {}
    const referencesToResolve: [string, AstReference][] = []

    function deserializeObservablyInternal(value: any): AstElement {
        if (isAstObject(value)) {
            const observableAstObject: AstObject = observable.object({
                id: value.id,
                concept: value.concept,
                settings: {}
            })
            for (const propertyName in value.settings) {
                observableAstObject.settings[propertyName] = deserializeObservablyInternal(value.settings[propertyName])
            }
            id2ObservableAstObject[value.id] = observableAstObject
            return observableAstObject
        }
        if (isSerializedAstReference(value)) {
            const refObjectToFix: AstReference = observable.object({ ref: null })
            referencesToResolve.push([ value.refId, refObjectToFix ])
            return refObjectToFix
        }
        if (Array.isArray(value)) {
            return value.map(deserializeObservablyInternal)
        }
        return value
    }

    const deserializedAst = deserializeObservablyInternal(serializedAst)

    referencesToResolve.forEach(([ refId, refObjectToFix ]) => {
        refObjectToFix.ref = id2ObservableAstObject[refId]
    })

    return deserializedAst
}


export function deepCopy(ast: AstElement) {
    const id2CopiedObject: {[id: string]: AstObject} = {}
    const referencesToResolve: [string, AstReference][] = []

    function deepCopyInternal(value: AstElement): AstElement {
        if (isAstObject(value)) {
            const copiedObject: AstObject = {
                id: value.id,
                concept: value.concept,
                settings: {}
            }
            for (const propertyName in value.settings) {
                copiedObject.settings[propertyName] = deepCopyInternal(value.settings[propertyName])
            }
            id2CopiedObject[value.id] = copiedObject
            return copiedObject
        }
        if (isAstReference(value)) {
            const refObjectToFix: AstReference = { ref: null }
            referencesToResolve.push([ value.ref?.id || "", refObjectToFix ])
            return refObjectToFix
        }
        if (Array.isArray(value)) {
            return value.map(deepCopyInternal)
        }
        return value
    }

    const copiedAst = deepCopyInternal(ast)

    referencesToResolve.forEach(([ refId, refObjectToFix ]) => {
        refObjectToFix.ref = id2CopiedObject[refId]
    })

    return copiedAst
}

