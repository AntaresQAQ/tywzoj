import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ProblemTagEntity } from "./problem-tag.entity";
import { IProblemTagBaseEntityWithExtra, IProblemTagEntityWithExtra } from "./problem-tag.types";
import { ProblemTagMapEntity } from "./problem-tag-map.entity";
import { ProblemTagTypeEntity } from "./problem-tag-type.entity";
import { IProblemTagTypeBaseEntityWithExtra, IProblemTagTypeEntityWithExtra } from "./problem-tag-type.types";

@Injectable()
export class ProblemTagService {
    constructor(
        @InjectRepository(ProblemTagEntity)
        private readonly problemTagRepository: Repository<ProblemTagEntity>,
        @InjectRepository(ProblemTagMapEntity)
        private readonly problemTagMapRepository: Repository<ProblemTagMapEntity>,
        @InjectRepository(ProblemTagTypeEntity)
        private readonly problemTagTypeRepository: Repository<ProblemTagTypeEntity>,
    ) {}

    public async findProblemTagListByProblemIdAsync(problemId: number): Promise<ProblemTagEntity[]> {
        const queryBuilder = this.problemTagRepository.createQueryBuilder("tag");
        const tagIdsQuery = queryBuilder
            .subQuery()
            .select("tagMap.problemTagId")
            .from(ProblemTagMapEntity, "tagMap")
            .where("tagMap.problemId = :problemId ", { problemId })
            .getQuery();
        queryBuilder.where(`id IN ${tagIdsQuery}`).orderBy("`order`", "ASC");
        return await queryBuilder.getMany();
    }

    public async findProblemTagListByTypeIdAsync(typeId: number) {
        return await this.problemTagRepository.find({ where: { typeId }, order: { order: "ASC" } });
    }

    public async findProblemTagTypeListAsync() {
        return await this.problemTagTypeRepository.find({ order: { order: "ASC" } });
    }

    public getProblemTagBaseDetail(tag: ProblemTagEntity): IProblemTagBaseEntityWithExtra {
        return {
            id: tag.id,
            name: tag.name,
            typeId: tag.typeId,
            order: tag.order,
        };
    }

    public async getProblemTagDetailAsync(tag: ProblemTagEntity): Promise<IProblemTagEntityWithExtra> {
        return {
            ...this.getProblemTagBaseDetail(tag),
            type: await tag.type,
        };
    }

    public getProblemTagTypeBaseDetail(tagType: ProblemTagTypeEntity): IProblemTagTypeBaseEntityWithExtra {
        return {
            id: tagType.id,
            name: tagType.name,
            color: tagType.color,
            order: tagType.order,
        };
    }

    public async getProblemTagTypeDetailAsync(tagType: ProblemTagTypeEntity): Promise<IProblemTagTypeEntityWithExtra> {
        return {
            ...this.getProblemTagTypeBaseDetail(tagType),
            tags: (await this.findProblemTagListByTypeIdAsync(tagType.id)).map((tag) =>
                this.getProblemTagBaseDetail(tag),
            ),
        };
    }
}
