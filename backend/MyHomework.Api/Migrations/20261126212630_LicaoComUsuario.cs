using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyHomework.Api.Migrations
{
    /// <inheritdoc />
    public partial class LicaoComUsuario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // As lições que já existiam não têm dono. Eram dados de teste,
            // então são apagadas antes de criar a chave estrangeira obrigatória
            // (senão o UsuarioId vazio não apontaria para nenhuma conta).
            migrationBuilder.Sql("DELETE FROM `Licoes`;");

            migrationBuilder.AddColumn<string>(
                name: "UsuarioId",
                table: "Licoes",
                type: "varchar(255)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Licoes_UsuarioId",
                table: "Licoes",
                column: "UsuarioId");

            migrationBuilder.AddForeignKey(
                name: "FK_Licoes_AspNetUsers_UsuarioId",
                table: "Licoes",
                column: "UsuarioId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Licoes_AspNetUsers_UsuarioId",
                table: "Licoes");

            migrationBuilder.DropIndex(
                name: "IX_Licoes_UsuarioId",
                table: "Licoes");

            migrationBuilder.DropColumn(
                name: "UsuarioId",
                table: "Licoes");
        }
    }
}
