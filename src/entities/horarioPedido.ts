import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class HorarioPedido extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ nullable: true })
    lunes: string;

    @Column({ nullable: true })
    martes: string;

    @Column({ nullable: true })
    miercoles: string;

    @Column({ nullable: true })
    jueves: string;

    @Column({ nullable: true })
    viernes: string;

    @Column({ nullable: true })
    sabado: string;

    @Column({ nullable: true })
    domingo: string;
}