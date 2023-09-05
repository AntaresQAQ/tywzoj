import objectPath from "object-path";

export const enum CE_ConfigRelationType {
    LessThan = "LessThan",
    LessThanOrEqual = "LessThanOrEqual",
    MoreThan = "MoreThan",
    MoreThanOrEqual = "MoreThanOrEqual",
}

function satisfy(thisValue: number, referencedValue: number, relationType: CE_ConfigRelationType) {
    switch (relationType) {
        case CE_ConfigRelationType.LessThan:
            return thisValue < referencedValue;
        case CE_ConfigRelationType.LessThanOrEqual:
            return thisValue <= referencedValue;
        case CE_ConfigRelationType.MoreThan:
            return thisValue > referencedValue;
        case CE_ConfigRelationType.MoreThanOrEqual:
            return thisValue >= referencedValue;
        default:
            return false;
    }
}

export interface IConfigRelationMetadata {
    referencedValuePath: string;
    relationType: CE_ConfigRelationType;
}

const CONFIG_RELATION_METADATA_KEY = "config-relation";

/**
 * Ensure this config item must satisfy `relationType` relation comparing to `referencedValuePath`
 * of config.
 *
 * @param referencedValuePath
 * @param relationType
 */
export function ConfigRelation(referencedValuePath: string, relationType: CE_ConfigRelationType) {
    return Reflect.metadata(CONFIG_RELATION_METADATA_KEY, <IConfigRelationMetadata>{
        referencedValuePath,
        relationType,
    });
}

function checkConfigRelationRecursively(
    configSubtree: Record<string, unknown>,
    currentPath: string,
    configRoot: Record<string, unknown>,
) {
    if (!configSubtree) return;

    Object.keys(configSubtree).forEach((key) => {
        const metadata = Reflect.getMetadata(
            CONFIG_RELATION_METADATA_KEY,
            configSubtree,
            key,
        ) as IConfigRelationMetadata;
        const item = configSubtree[key];

        if (typeof item === "number" && metadata) {
            const thisValue = item;
            const referencedValue = objectPath.get(configRoot, metadata.referencedValuePath) as number;
            if (!satisfy(thisValue, referencedValue, metadata.relationType)) {
                throw new Error(
                    `Config validation error: ${currentPath}${key} must satisfy the relation "${metadata.relationType}" when comparing to ${metadata.referencedValuePath}`,
                );
            }
        }

        if (typeof item === "object") {
            checkConfigRelationRecursively(item as Record<string, unknown>, `${currentPath}.${key}`, configRoot);
        }
    });
}

export function checkConfigRelation(config: Record<string, unknown>) {
    checkConfigRelationRecursively(config, "", config);
}
