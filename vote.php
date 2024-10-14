<?php include ('head.php');?>
<?php include("sess.php");?>
<body>
	<?php include 'side_bar.php'; ?>
    <div id="wrapper">
    </div>
	<form method = "POST" action = "vote_result.php">
	<div class="col-lg-6">
	
                    <div class="panel panel-primary">
                        <div class="panel-heading"><center>
                            PRESIDENT</center>
                        </div>
                        <div class="panel-body" style = "background-color:; display:block;">
						<?php
							$query = $conn->query("SELECT * FROM `candidate` WHERE `position` = 'President'") or die(mysqli_errno());
							while($fetch = $query->fetch_array())
						{
						?>
                           <div id = "position">
							<center><img src = "admin/<?php echo $fetch['img']?>" style ="border-radius:6px;" height = "150px" width = "150px" class = "img"></center>
							
							<center><?php echo "<strong>Names: </strong>".$fetch['firstname']." ".$fetch['lastname']."<br/><strong>Gender: </strong> ".$fetch['gender']."<br/><strong>Level: </strong> ".$fetch['year_level']."<br/><strong>Party: </strong> ".$fetch['party']?></center>
							<center><input type = "checkbox" value = "<?php echo $fetch['candidate_id'] ?>" name = "pres_id" class = "pres">Give Vote</center>
							</div>
	
						<?php
							}
						?>

						</div>
                       
                    </div>
     </div>
				
				
				<div class="col-lg-6">
	
                    <div class="panel panel-primary">
                        <div class="panel-heading"><center>
							VICE PRESIDENT</center>
                        </div>
                        <div class="panel-body" style = "background-color:;">
						<?php
							$query = $conn->query("SELECT * FROM `candidate` WHERE `position` = 'Vice President'") or die(mysqli_errno());
							while($fetch = $query->fetch_array()){
						?>
		<div id = "position">
			<center><img class = "image-rounded" src = "admin/<?php echo $fetch['img']?>"style ="border-radius:6px;" height = "150px" width = "150px"></center>
		    <center><?php echo "<strong>Names: </strong>".$fetch['firstname']." ".$fetch['lastname']."<br/><strong>Gender: </strong> ".$fetch['gender']."<br/><strong>Level: </strong> ".$fetch['year_level']."<br/><strong>Party: </strong> ".$fetch['party']?></center>
			<center><input type = "checkbox" value = "<?php echo $fetch['candidate_id'] ?>" name = "vp_id" class = "vpres">Give Vote</center>
		</div>
						<?php
							}
						?>

						</div>
                       
                    </div>
                </div>
	
	
	
	<div class="col-lg-6">
	  <div class="panel panel-primary">
            <div class="panel-heading">
			<center>SECRETARY</center>
            </div>
            <div class="panel-body" style = "background-color:;">
				<?php
					$query = $conn->query("SELECT * FROM `candidate` WHERE `position` = 'Secretary'") or die(mysqli_errno());
					while($fetch = $query->fetch_array())
					{
				?>
						<div id = "position">
							<center><img src = "admin/<?php echo $fetch['img']?>" style ="border-radius:6px;" height = "150px" width = "150px" class = "img"></center>
						<center><?php echo "<strong>Names: </strong>".$fetch['firstname']." ".$fetch['lastname']."<br/><strong>Gender: </strong> ".$fetch['gender']."<br/><strong>Level: </strong> ".$fetch['year_level']."<br/><strong>Party: </strong> ".$fetch['party']?></center>
						<center><input type = "checkbox" value = "<?php echo $fetch['candidate_id'] ?>" name = "ua_id" class = "ua">Give Vote</center>
						</div>
	
				<?php
					}
				?>
			</div>      
        </div>
     </div>
	<div class="col-lg-6">
	  <div class="panel panel-primary">
            <div class="panel-heading">
			<center>TREASURER</center>
            </div>
            <div class="panel-body" style = "background-color:;">
				<?php
					$query = $conn->query("SELECT * FROM `candidate` WHERE `position` = 'Treasurer'") or die(mysqli_errno());
					while($fetch = $query->fetch_array())
					{
				?>
						<div id = "position">
							<center><img src = "admin/<?php echo $fetch['img']?>" style ="border-radius:6px;" height = "150px" width = "150px" class = "img"></center>
							<center><?php echo "<strong>Names: </strong>".$fetch['firstname']." ".$fetch['lastname']."<br/><strong>Gender: </strong> ".$fetch['gender']."<br/><strong>Level: </strong> ".$fetch['year_level']."<br/><strong>Party: </strong> ".$fetch['party']?></center>
						<center><input type = "checkbox" value = "<?php echo $fetch['candidate_id'] ?>" name = "ss_id" class = "ss">Give Vote</center>
						</div>
	
				<?php
					}
				?>
			</div>      
        </div>
     </div>	
	
	<div class="col-lg-6">
	  <div class="panel panel-primary">
            <div class="panel-heading">
			<center>P.R.O</center>
            </div>
            <div class="panel-body" style = "background-color:;">
				<?php
					$query = $conn->query("SELECT * FROM `candidate` WHERE `position` = 'P.R.O'") or die(mysqli_errno());
					while($fetch = $query->fetch_array())
					{
				?>
						<div id = "position">
							<center><img src = "admin/<?php echo $fetch['img']?>" style ="border-radius:6px;" height = "150px" width = "150px" class = "img"></center>
							<center><?php echo "<strong>Names: </strong>".$fetch['firstname']." ".$fetch['lastname']."<br/><strong>Gender: </strong> ".$fetch['gender']."<br/><strong>Level: </strong> ".$fetch['year_level']."<br/><strong>Party: </strong> ".$fetch['party']?></center>
							<center><input type = "checkbox" value = "<?php echo $fetch['candidate_id'] ?>" name = "ea_id" class = "ea">Give Vote</center>
						</div>
	
				<?php
					}
				?>
			</div>      
        </div>
     </div>
	 <div class="col-lg-6">
	  <div class="panel panel-primary">
            <div class="panel-heading">
			<center>FIRST-YEAR REPRESENTATIVE</center>
            </div>
            <div class="panel-body" style = "background-color:;">
				<?php
					$query = $conn->query("SELECT * FROM `candidate` WHERE `position` = 'First-Year Representative'") or die(mysqli_errno());
					while($fetch = $query->fetch_array())
					{
				?>
						<div id = "position">
							<center><img src = "admin/<?php echo $fetch['img']?>" style ="border-radius:6px;" height = "150px" width = "150px" class = "img"></center>
							<center><?php echo "<strong>Names: </strong>".$fetch['firstname']." ".$fetch['lastname']."<br/><strong>Gender: </strong> ".$fetch['gender']."<br/><strong>Level: </strong> ".$fetch['year_level']."<br/><strong>Party: </strong> ".$fetch['party']?></center>
							<center><input type = "checkbox"  value = "<?php echo $fetch['candidate_id'] ?>" name = "treasurer_id" class = "treasurer">Give Vote</center>
						</div>
	
				<?php
					}
				?>
			</div>      
        </div>
     </div>
	<div class="col-lg-6">
	  <div class="panel panel-primary">
            <div class="panel-heading">
			<center>SECOND-YEAR REPRESENTATIVE</center>
            </div>
            <div class="panel-body" style = "background-color:;">
				<?php
					$query = $conn->query("SELECT * FROM `candidate` WHERE `position` = 'Second-Year Representative'") or die(mysqli_errno());
					while($fetch = $query->fetch_array())
					{
				?>
						<div id = "position">
							<center><img src = "admin/<?php echo $fetch['img']?>" style ="border-radius:6px;" height = "150px" width = "150px" class = "img"></center>
						<center><?php echo "<strong>Names: </strong>".$fetch['firstname']." ".$fetch['lastname']."<br/><strong>Gender: </strong> ".$fetch['gender']."<br/><strong>Level: </strong> ".$fetch['year_level']."<br/><strong>Party: </strong> ".$fetch['party']?></center>
							<center><input type = "checkbox" value = "<?php echo $fetch['candidate_id'] ?>" name = "vtr_id" class = "vtr">Give Vote</center>
						</div>
	
				<?php
					}
				?>
			</div>      
        </div>
     </div>
	<div class="col-lg-6">
	  <div class="panel panel-primary">
            <div class="panel-heading">
			<center>THIRD-YEAR REPRESENTATIVE</center>
            </div>
            <div class="panel-body" style = "background-color:;">
				<?php
					$query = $conn->query("SELECT * FROM `candidate` WHERE `position` = 'Third-Year Representative'") or die(mysqli_errno());
					while($fetch = $query->fetch_array())
					{
				?>
						<div id = "position">
							<center><img src = "admin/<?php echo $fetch['img']?>" style ="border-radius:6px;" height = "150px" width = "150px" class = "img"></center>
						<center><?php echo "<strong>Names: </strong>".$fetch['firstname']." ".$fetch['lastname']."<br/><strong>Gender: </strong> ".$fetch['gender']."<br/><strong>Level: </strong> ".$fetch['year_level']."<br/><strong>Party: </strong> ".$fetch['party']?></center>
							<center><input type = "checkbox"  value = "<?php echo $fetch['candidate_id'] ?>" name = "sg_id" class = "sg">Give Vote</center>
						</div>
	
				<?php
					}
				?>
			</div>      
        </div>
     </div>
	<div class="col-lg-6">
	  <div class="panel panel-primary">
            <div class="panel-heading">
			<center>FOURTH-YEAR REPRESENTATIVE</center>
            </div>
            <div class="panel-body" style = "background-color:;">
				<?php
					$query = $conn->query("SELECT * FROM `candidate` WHERE `position` = 'Fourth-Year Representative'") or die(mysqli_errno());
					while($fetch = $query->fetch_array())
					{
				?>
						<div id = "position">
							<center><img src = "admin/<?php echo $fetch['img']?>" style ="border-radius:6px;" height = "150px" width = "150px" class = "img"></center>
							<center><?php echo "<strong>Names: </strong>".$fetch['firstname']." ".$fetch['lastname']."<br/><strong>Gender: </strong> ".$fetch['gender']."<br/><strong>Level: </strong> ".$fetch['year_level']."<br/><strong>Party: </strong> ".$fetch['party']?></center>
							<center><input type = "checkbox"  value = "<?php echo $fetch['candidate_id'] ?>" name = "tas_id" class = "tas">Give Vote</center>
						</div>
	
				<?php
					}
				?>
			</div>      
        </div>
     </div>
	

     
     <hr/>
		
		<center><button class = "btn btn-success ballot" type = "submit" name = "submit">Submit Ballot</button></center>
		&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
		</form>
</body>
<?php include ('script.php');
include ('footer.php');?>
  
  <script type = "text/javascript">
		$(document).ready(function(){
			$(".pres").on("change", function(){
				if($(".pres:checked").length == 1)
					{
						$(".pres").attr("disabled", "disabled");
						$(".pres:checked").removeAttr("disabled");
					}
				else
					{
						$(".pres").removeAttr("disabled");
					}
			});
			
			$(".vpres").on("change", function(){
				if($(".vpres:checked").length == 1)
					{
						$(".vpres").attr("disabled", "disabled");
						$(".vpres:checked").removeAttr("disabled");
					}
				else
					{
						$(".vpres").removeAttr("disabled");
					}
			});
			
			$(".ua").on("change", function(){
				if($(".ua:checked").length == 1)
					{
						$(".ua").attr("disabled", "disabled");
						$(".ua:checked").removeAttr("disabled");
					}
				else
					{
						$(".ua").removeAttr("disabled");
					}
			});
			
			$(".ss").on("change", function(){
				if($(".ss:checked").length == 1)
					{
						$(".ss").attr("disabled", "disabled");
						$(".ss:checked").removeAttr("disabled");
					}
				else
					{
						$(".ss").removeAttr("disabled");
					}
			});
			
			$(".ea").on("change", function(){
				if($(".ea:checked").length == 1)
					{
						$(".ea").attr("disabled", "disabled");
						$(".ea:checked").removeAttr("disabled");
					}
				else
					{
						$(".ea").removeAttr("disabled");
					}
			});
			
			$(".treasurer").on("change", function(){
				if($(".treasurer:checked").length == 1)
					{
						$(".treasurer").attr("disabled", "disabled");
						$(".treasurer:checked").removeAttr("disabled");
					}
				else
					{
						$(".treasurer").removeAttr("disabled");
					}
				
			});
			$(".vtr").on("change", function(){
				if($(".vtr:checked").length == 1)
					{
						$(".vtr").attr("disabled", "disabled");
						$(".vtr:checked").removeAttr("disabled");
					}
				else
					{
						$(".vtr").removeAttr("disabled");
					}
			});
			$(".sg").on("change", function(){
				if($(".sg:checked").length == 1)
				{
					$(".sg").attr("disabled", "disabled");
					$(".sg:checked").removeAttr("disabled");
				}
			else
				{
					$(".sg").removeAttr("disabled");
				}
			});
			$(".tas").on("change", function(){
				if($(".tas:checked").length == 1)
				{
					$(".tas").attr("disabled", "disabled");
					$(".tas:checked").removeAttr("disabled");
				}
			else
				{
					$(".tas").removeAttr("disabled");
				}
			});
			$(".ps").on("change", function(){
				if($(".ps:checked").length == 1)
				{
					$(".ps").attr("disabled", "disabled");
					$(".ps:checked").removeAttr("disabled");
				}
			else
				{
					$(".ps").removeAttr("disabled");
				}
			});
			$(".as").on("change", function(){
				if($(".as:checked").length == 1)
				{
					$(".as").attr("disabled", "disabled");
					$(".as:checked").removeAttr("disabled");
				}
			else
				{
					$(".as").removeAttr("disabled");
				}
			});
		});	
	</script>
</html>

